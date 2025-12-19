/*
 * SOLIDARITY PLATFORM - ERROR HANDLER UTILITY
 * ============================================
 * 
 * Comprehensive error handling for production-ready API
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error types
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

class SafetyError extends AppError {
  constructor(message = 'Safety level too low for operation') {
    super(message, 503, 'SAFETY_ERROR');
  }
}

/**
 * Express middleware for error handling
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next function
 */
function createErrorHandler() {
  return (err, req, res, next) => {
    // Log error
    console.error('Error:', {
      message: err.message,
      code: err.code || 'UNKNOWN',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Operational error (expected)
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
        code: err.code
      });
    }

    // Joi validation errors
    if (err.isJoi) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.details.map(d => ({
          message: d.message,
          path: d.path,
          type: d.type
        }))
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Programming error (unexpected)
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };
}

/**
 * Async handler wrapper (prevents try-catch in every route)
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create validation middleware from Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
function createValidationMiddleware(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
}

/**
 * Not found handler (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
    code: 'NOT_FOUND'
  });
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  InternalError,
  SafetyError,
  createErrorHandler,
  asyncHandler,
  createValidationMiddleware,
  notFoundHandler
};
