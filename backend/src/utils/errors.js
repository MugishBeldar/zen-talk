/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(code, message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = {}) {
    super('AUTHENTICATION_REQUIRED', message, 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details = {}) {
    super('ACCESS_DENIED', message, 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = {}) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = {}) {
    super('RESOURCE_NOT_FOUND', `${resource} not found`, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = {}) {
    super('RESOURCE_CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = {}) {
    super('RATE_LIMIT_EXCEEDED', message, 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Token Error
 */
export class TokenError extends AppError {
  constructor(message = 'Invalid token', details = {}) {
    super('INVALID_TOKEN', message, 401, details);
    this.name = 'TokenError';
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = {}) {
    super('DATABASE_ERROR', message, 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Error code mappings
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTHENTICATION_REQUIRED: { status: 401, message: 'Authentication required' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token' },
  INVALID_REFRESH_TOKEN: { status: 401, message: 'Invalid refresh token' },
  TOKEN_REUSE_DETECTED: { status: 403, message: 'Token reuse detected' },
  
  // Authorization errors
  ACCESS_DENIED: { status: 403, message: 'Access denied' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },
  
  // Validation errors
  VALIDATION_ERROR: { status: 400, message: 'Validation failed' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Required field missing' },
  INVALID_FORMAT: { status: 400, message: 'Invalid format' },
  
  // Resource errors
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  RESOURCE_NOT_FOUND: { status: 404, message: 'Resource not found' },
  USER_EXISTS: { status: 409, message: 'User already exists' },
  RESOURCE_CONFLICT: { status: 409, message: 'Resource conflict' },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Rate limit exceeded' },
  
  // Account status
  ACCOUNT_LOCKED: { status: 423, message: 'Account locked' },
  ACCOUNT_DISABLED: { status: 403, message: 'Account disabled' },
  
  // Server errors
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { status: 500, message: 'Database error' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service unavailable' }
};

/**
 * Create error response object
 * @param {Error} error - Error object
 * @param {string} path - Request path
 * @param {string} requestId - Request ID
 * @returns {Object} - Formatted error response
 */
export const createErrorResponse = (error, path = '', requestId = '') => {
  const isOperational = error.isOperational || false;
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  
  // Get error details from mapping or use error properties
  const errorMapping = ERROR_CODES[code];
  const message = error.message || errorMapping?.message || 'An unexpected error occurred';
  
  const response = {
    success: false,
    error: code,
    message,
    timestamp: new Date().toISOString(),
    path,
    requestId,
    statusCode
  };
  
  // Add details if available
  if (error.details && Object.keys(error.details).length > 0) {
    response.details = error.details;
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
};

/**
 * Handle Mongoose validation errors
 * @param {Error} error - Mongoose validation error
 * @returns {ValidationError} - Formatted validation error
 */
export const handleValidationError = (error) => {
  const details = {};
  let message = 'Validation failed';

  // Handle Joi validation errors
  if (error.details && Array.isArray(error.details)) {
    // Extract individual field errors
    error.details.forEach(detail => {
      const fieldPath = detail.path.join('.');
      details[fieldPath] = detail.message;
    });

    // Create a comprehensive error message from all validation errors
    const errorMessages = error.details.map(detail => detail.message);
    message = errorMessages.join(', ');
  }
  // Handle Mongoose validation errors
  else if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      const err = error.errors[key];
      details[key] = err.message;
    });

    // Create message from Mongoose errors
    const errorMessages = Object.values(error.errors).map(err => err.message);
    message = errorMessages.join(', ');
  }
  // Handle custom validation errors with details
  else if (error.details && typeof error.details === 'object') {
    Object.assign(details, error.details);

    // If details.messages exists, use it for the main message
    if (error.details.messages && Array.isArray(error.details.messages)) {
      message = error.details.messages.join(', ');
    }
  }

  return new ValidationError(message, details);
};

/**
 * Handle Mongoose duplicate key errors
 * @param {Error} error - Mongoose duplicate key error
 * @returns {ConflictError} - Formatted conflict error
 */
export const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  const details = {
    field,
    value,
    message: `${field} '${value}' already exists`
  };
  
  return new ConflictError(`Duplicate ${field}`, details);
};

/**
 * Handle Mongoose cast errors
 * @param {Error} error - Mongoose cast error
 * @returns {ValidationError} - Formatted validation error
 */
export const handleCastError = (error) => {
  const details = {
    field: error.path,
    value: error.value,
    expectedType: error.kind
  };
  
  return new ValidationError(`Invalid ${error.path}`, details);
};

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {TokenError} - Formatted token error
 */
export const handleJWTError = (error) => {
  if (error.name === 'TokenExpiredError') {
    return new TokenError('Token has expired');
  } else if (error.name === 'JsonWebTokenError') {
    return new TokenError('Invalid token');
  } else if (error.name === 'NotBeforeError') {
    return new TokenError('Token not active yet');
  }
  
  return new TokenError('Token verification failed');
};

/**
 * Check if error is operational
 * @param {Error} error - Error to check
 * @returns {boolean} - True if operational error
 */
export const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Log error with context
 * @param {Error} error - Error to log
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you would send this to a logging service
  // like Winston, Sentry, or CloudWatch
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Success response
 */
export const createSuccessResponse = (data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return response;
};

export default {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  TokenError,
  DatabaseError,
  ERROR_CODES,
  createErrorResponse,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError,
  isOperationalError,
  logError,
  asyncHandler,
  createSuccessResponse
};
