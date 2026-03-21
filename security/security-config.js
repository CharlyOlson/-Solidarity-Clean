/*
 * SOLIDARITY PLATFORM - SECURITY CONFIGURATION
 * ============================================
 * 
 * Central security configuration and middleware
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { SecureURLValidator, InputSanitizer, SecurityHeaders } = require('./input-validator');

/**
 * Security Configuration
 */
class SecurityConfig {
  constructor() {
    this.urlValidator = new SecureURLValidator();
    
    // Security settings
    this.settings = {
      // Rate limiting
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        message: 'Too many requests, please try again later.'
      },
      
      // CORS settings
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: process.env.CORS_CREDENTIALS === 'true',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      
      // File upload settings
      fileUpload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',')
      },
      
      // Input validation
      validation: {
        maxStringLength: 1000,
        maxArrayLength: 100,
        maxObjectDepth: 5
      },
      
      // Blockchain security
      blockchain: {
        testMode: process.env.FINANCIAL_TEST_MODE !== 'false',
        maxGasPrice: parseInt(process.env.MAX_GAS_PRICE) || 100,
        requireConfirmation: true
      }
    };
  }

  /**
   * Get Express middleware for security headers
   */
  getSecurityHeadersMiddleware() {
    return (req, res, next) => {
      SecurityHeaders.applyHeaders(res);
      next();
    };
  }

  /**
   * Recursively sanitize query parameter values, including arrays and objects.
   */
  sanitizeQueryValue(value, depth = 0) {
    if (value == null) {
      return value;
    }

    if (typeof value === 'string') {
      return InputSanitizer.sanitizeString(
        value,
        this.settings.validation.maxStringLength
      );
    }

    if (Array.isArray(value)) {
      if (depth >= this.settings.validation.maxObjectDepth) {
        return [];
      }
      const maxLength = this.settings.validation.maxArrayLength;
      return value
        .slice(0, maxLength)
        .map(item => this.sanitizeQueryValue(item, depth + 1));
    }

    if (typeof value === 'object') {
      if (depth >= this.settings.validation.maxObjectDepth) {
        return {};
      }
      const sanitizedObject = {};
      for (const key of Object.keys(value)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          // Skip dangerous keys to prevent prototype pollution in nested query parameters
          continue;
        }
        sanitizedObject[key] = this.sanitizeQueryValue(value[key], depth + 1);
      }
      return sanitizedObject;
    }

    return value;
  }

  /**
   * Get Express middleware for request sanitization
   */
  getSanitizationMiddleware() {
    return (req, res, next) => {
      // Sanitize query parameters
      if (req.query) {
        for (const key of Object.keys(req.query)) {
          // Avoid prototype pollution by skipping dangerous keys
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
          }
          req.query[key] = this.sanitizeQueryValue(req.query[key]);
        }
      }

      // Sanitize body parameters
      if (Array.isArray(req.body)) {
        req.body = req.body
          .slice(0, this.settings.validation.maxArrayLength)
          .map(item => {
            if (item && typeof item === 'object') {
              return this.sanitizeObject(item);
            }
            if (typeof item === 'string') {
              return InputSanitizer.sanitizeString(
                item,
                this.settings.validation.maxStringLength
              );
            }
            return item;
          });
      } else if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      next();
    };
  }

  /**
   * Recursively sanitize object
   */
  sanitizeObject(obj, depth = 0) {
    if (depth > this.settings.validation.maxObjectDepth) {
      return {};
    }

    const sanitized = Object.create(null);
    for (const key of Object.keys(obj)) {
      // Avoid prototype pollution by skipping dangerous keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = InputSanitizer.sanitizeString(
          value,
          this.settings.validation.maxStringLength
        );
      } else if (Array.isArray(value)) {
        sanitized[key] = value
          .slice(0, this.settings.validation.maxArrayLength)
          .map(item => {
            if (item && typeof item === 'object') {
              return this.sanitizeObject(item, depth + 1);
            }
            if (typeof item === 'string') {
              return InputSanitizer.sanitizeString(
                item,
                this.settings.validation.maxStringLength
              );
            }
            return item;
          });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Validate URL input
   */
  validateURL(url, options = {}) {
    return this.urlValidator.validateURL(url, options);
  }

  /**
   * Get file upload validation middleware
   */
  getFileUploadValidationMiddleware() {
    return (req, res, next) => {
      if (!req.file && !req.files) {
        return next();
      }

      let files = [];
      if (Array.isArray(req.files)) {
        // e.g., multer upload.array()
        files = req.files;
      } else if (req.files && typeof req.files === 'object') {
        // e.g., multer upload.fields() => object of arrays
        for (const fieldFiles of Object.values(req.files)) {
          if (Array.isArray(fieldFiles)) {
            files.push(...fieldFiles);
          }
        }
      } else if (req.file) {
        // e.g., multer upload.single()
        files = [req.file];
      }

      if (!files.length) {
        return next();
      }
      
      for (const file of files) {
        // Check file size
        if (file.size > this.settings.fileUpload.maxSize) {
          return res.status(400).json({
            success: false,
            error: `File size exceeds maximum allowed size of ${this.settings.fileUpload.maxSize} bytes`
          });
        }

        // Check file type
        if (!this.settings.fileUpload.allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            error: `File type ${file.mimetype} not allowed`
          });
        }

        // Sanitize filename
        file.originalname = InputSanitizer.sanitizeFilePath(file.originalname);
      }

      next();
    };
  }

  /**
   * Get blockchain transaction validation middleware
   */
  getBlockchainSecurityMiddleware() {
    return (req, res, next) => {
      // Guard against missing or non-object body
      if (!req.body || typeof req.body !== 'object') {
        return next();
      }

      // Ensure test mode in development
      if (this.settings.blockchain.testMode && req.body.network === 'mainnet') {
        return res.status(403).json({
          success: false,
          error: 'Test mode enabled - mainnet transactions not allowed'
        });
      }

      // Validate gas price
      if (req.body.gasPrice && req.body.gasPrice > this.settings.blockchain.maxGasPrice) {
        return res.status(400).json({
          success: false,
          error: `Gas price exceeds maximum allowed: ${this.settings.blockchain.maxGasPrice}`
        });
      }

      next();
    };
  }

  /**
   * Create audit log entry
   */
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event.type,
      severity: event.severity || 'info',
      details: event.details || {},
      ip: event.ip,
      user: event.user || 'anonymous'
    };

    // In production, this should write to a secure logging system
    console.log('🔒 Security Event:', JSON.stringify(logEntry));
    
    return logEntry;
  }
}

// Singleton instance
const securityConfig = new SecurityConfig();

module.exports = {
  SecurityConfig,
  securityConfig,
  SecureURLValidator,
  InputSanitizer,
  SecurityHeaders
};
