/**
 * Enhanced Error Middleware with Professional Error Handling
 */

const logger = require('../utils/logger');
const { AppError, ValidationError } = require('../utils/errors');

/**
 * Global error handler middleware
 * Should be placed AFTER all other middleware and routes
 */
const errorHandler = (err, req, res, next) => {
  // Set default values
  let status = err.statusCode || 500;
  let response = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId: req.id || null
    }
  };

  // Add validation details if available
  if (err instanceof ValidationError && err.details) {
    response.error.details = err.details;
  }

  // Log the error
  const logLevel = status >= 500 ? 'error' : 'warn';
  logger[logLevel](`[${req.method} ${req.path}] Error:`, {
    statusCode: status,
    code: err.code,
    message: err.message,
    requestId: req.id,
    userId: req.user?.id,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    response.error.code = 'INVALID_TOKEN';
    response.error.message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    response.error.code = 'TOKEN_EXPIRED';
    response.error.message = 'Authentication token has expired';
  } else if (err.message.includes('UNIQUE')) {
    status = 409;
    response.error.code = 'DUPLICATE_ENTRY';
    response.error.message = 'This record already exists';
  } else if (err.message.includes('FOREIGN KEY')) {
    status = 409;
    response.error.code = 'FOREIGN_KEY_VIOLATION';
    response.error.message = 'Cannot delete record with dependent entries';
  }

  res.status(status).json(response);
};

/**
 * Async error wrapper - wraps async route handlers and catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
