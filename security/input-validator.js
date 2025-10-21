/*
 * SOLIDARITY PLATFORM - SECURITY INPUT VALIDATOR
 * ==============================================
 * 
 * Enhanced input validation and sanitization middleware
 * Provides additional security layers beyond validator.js
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

/**
 * URL Validation with multiple security layers
 * Addresses GHSA-9965-vmph-33xx validator.js vulnerability
 */
class SecureURLValidator {
  constructor() {
    // Allowed URL protocols
    this.allowedProtocols = ['http:', 'https:'];
    
    // Dangerous patterns to block
    this.dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /about:/i,
      /<script/i,
      /onclick/i,
      /onerror/i,
      /onload/i
    ];
    
    // Additional XSS patterns
    this.xssPatterns = [
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /eval\(/i,
      /expression\(/i
    ];
  }

  /**
   * Validate URL with enhanced security checks
   * @param {string} url - URL to validate
   * @param {Object} options - Validation options
   * @returns {Object} - {valid: boolean, sanitized: string, errors: array}
   */
  validateURL(url, options = {}) {
    const errors = [];
    
    // Check for null/undefined
    if (!url) {
      return { valid: false, sanitized: '', errors: ['URL is required'] };
    }

    // Convert to string and trim
    url = String(url).trim();

    // Check for empty string
    if (url.length === 0) {
      return { valid: false, sanitized: '', errors: ['URL cannot be empty'] };
    }

    // Check for dangerous patterns first
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(url)) {
        errors.push(`URL contains dangerous pattern: ${pattern}`);
      }
    }

    // Check for XSS patterns
    for (const pattern of this.xssPatterns) {
      if (pattern.test(url)) {
        errors.push(`URL contains potential XSS pattern: ${pattern}`);
      }
    }

    // If dangerous patterns found, reject immediately
    if (errors.length > 0) {
      return { valid: false, sanitized: '', errors };
    }

    // Try to parse URL
    let parsedURL;
    try {
      parsedURL = new URL(url);
    } catch (e) {
      // If URL is relative, try with a base
      try {
        parsedURL = new URL(url, 'https://example.com');
        if (!options.allowRelative) {
          return { valid: false, sanitized: '', errors: ['Relative URLs not allowed'] };
        }
      } catch (e2) {
        return { valid: false, sanitized: '', errors: ['Invalid URL format'] };
      }
    }

    // Check protocol
    if (!this.allowedProtocols.includes(parsedURL.protocol)) {
      errors.push(`Protocol not allowed: ${parsedURL.protocol}`);
    }

    // Additional hostname validation
    if (parsedURL.hostname) {
      // Check for localhost/private IPs if not allowed
      if (!options.allowLocalhost && this.isLocalhost(parsedURL.hostname)) {
        errors.push('Localhost URLs not allowed');
      }

      // Check for private IP ranges if not allowed
      if (!options.allowPrivateIP && this.isPrivateIP(parsedURL.hostname)) {
        errors.push('Private IP addresses not allowed');
      }
    }

    const sanitized = parsedURL.toString();
    return {
      valid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : '',
      errors,
      protocol: parsedURL.protocol,
      hostname: parsedURL.hostname,
      pathname: parsedURL.pathname
    };
  }

  /**
   * Check if hostname is localhost
   */
  isLocalhost(hostname) {
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '::1' ||
           hostname.endsWith('.localhost');
  }

  /**
   * Check if IP is in private range
   */
  isPrivateIP(hostname) {
    // Check for IPv4 private ranges
    const privateIPv4Patterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./
    ];

    for (const pattern of privateIPv4Patterns) {
      if (pattern.test(hostname)) {
        return true;
      }
    }

    // Check for IPv6 private ranges
    if (hostname.startsWith('fc') || hostname.startsWith('fd')) {
      return true;
    }

    return false;
  }
}

/**
 * Input Sanitizer for various data types
 */
class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input, maxLength = 1000) {
    if (!input) return '';
    
    let sanitized = String(input).trim();
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    return sanitized;
  }

  /**
   * Sanitize HTML - strip all tags and dangerous patterns
   */
  static sanitizeHTML(input) {
    if (!input) return '';
    let sanitized = String(input);
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove style tags and their content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove all other HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    return sanitized;
  }

  /**
   * Sanitize SQL input - escape dangerous characters
   */
  static sanitizeSQL(input) {
    if (!input) return '';
    return String(input)
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/\0/g, '\\0');
  }

  /**
   * Sanitize file path
   */
  static sanitizeFilePath(input) {
    if (!input) return '';
    
    // Remove path traversal attempts and dangerous characters
    return String(input)
      .replace(/\.\./g, '')
      .replace(/\//g, '')  // Remove all slashes
      .replace(/\\/g, '')  // Remove backslashes
      .replace(/[<>:"|?*]/g, '')
      .replace(/\0/g, '');
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(input) {
    if (!input) return '';
    
    const email = String(input).trim().toLowerCase();
    
    // Basic email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return '';
    }
    
    return email;
  }

  /**
   * Validate numeric input
   */
  static sanitizeNumber(input, options = {}) {
    const num = Number(input);
    
    if (isNaN(num)) {
      return options.defaultValue || 0;
    }
    
    // Check min/max
    if (options.min !== undefined && num < options.min) {
      return options.min;
    }
    
    if (options.max !== undefined && num > options.max) {
      return options.max;
    }
    
    // Check if integer required
    if (options.integer && !Number.isInteger(num)) {
      return Math.floor(num);
    }
    
    return num;
  }
}

/**
 * Rate Limiting Helper
 */
class RateLimitHelper {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if request should be rate limited
   */
  checkLimit(identifier, options = {}) {
    const maxRequests = options.maxRequests || 100;
    const windowMs = options.windowMs || 60000; // 1 minute default
    
    const now = Date.now();
    const requestData = this.requests.get(identifier) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now >= requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + windowMs;
    }
    
    requestData.count++;
    this.requests.set(identifier, requestData);
    
    return {
      allowed: requestData.count <= maxRequests,
      remaining: Math.max(0, maxRequests - requestData.count),
      resetTime: requestData.resetTime
    };
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now >= value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Security Headers Helper
 */
class SecurityHeaders {
  /**
   * Get recommended security headers
   */
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  /**
   * Apply security headers to response
   */
  static applyHeaders(res) {
    const headers = this.getSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
}

module.exports = {
  SecureURLValidator,
  InputSanitizer,
  RateLimitHelper,
  SecurityHeaders
};
