import { v4 as uuidv4 } from 'uuid';
import {
  createErrorResponse,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError,
  isOperationalError,
  logError
} from '../utils/errors.js';

/**
 * Request ID middleware - adds unique ID to each request
 */
export const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Generate request ID if not present
  const requestId = req.id || uuidv4();
  
  // Log error with context
  logError(err, {
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  let error = err;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    error = handleJWTError(err);
  }

  // Create error response
  const errorResponse = createErrorResponse(error, req.path, requestId);

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limit error handler
 */
export const rateLimitHandler = (req, res, next, options) => {
  const error = new Error('Too many requests, please try again later');
  error.statusCode = 429;
  error.code = 'RATE_LIMIT_EXCEEDED';
  error.details = {
    limit: options.max,
    window: options.windowMs,
    retryAfter: Math.round(options.windowMs / 1000)
  };
  
  next(error);
};

/**
 * CORS error handler
 */
export const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    const error = new Error('Cross-origin request not allowed');
    error.statusCode = 403;
    error.code = 'CORS_ERROR';
    return next(error);
  }
  next(err);
};

/**
 * Validation error formatter for express-validator
 */
export const formatValidationErrors = (errors) => {
  const details = {};
  errors.forEach(error => {
    details[error.path || error.param] = error.msg;
  });
  return details;
};

/**
 * Database connection error handler
 */
export const databaseErrorHandler = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    const error = new Error('Database operation failed');
    error.statusCode = 500;
    error.code = 'DATABASE_ERROR';
    return next(error);
  }
  next(err);
};

/**
 * Unhandled promise rejection handler
 */
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Log the error
    logError(new Error('Unhandled Promise Rejection'), {
      reason: reason.toString(),
      stack: reason.stack
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Uncaught exception handler
 */
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Log the error
    logError(error, {
      type: 'uncaughtException'
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdownHandler = (server) => {
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('Server closed successfully');
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default {
  requestId,
  errorHandler,
  notFound,
  asyncHandler,
  rateLimitHandler,
  corsErrorHandler,
  formatValidationErrors,
  databaseErrorHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdownHandler
};
