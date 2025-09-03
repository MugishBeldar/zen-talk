import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/index.js';

/**
 * Check if rate limiting should be skipped in development
 */
const shouldSkipRateLimit = () => {
  return process.env.NODE_ENV === 'development' || process.env.SKIP_RATE_LIMIT === 'true';
};

/**
 * Create rate limiter with custom configuration
 */
const createRateLimiter = (config) => {
  // Skip rate limiting in development mode
  if (shouldSkipRateLimit()) {
    return (req, res, next) => {
      console.log(`🔓 Rate limiting skipped for ${req.method} ${req.path} (development mode)`);
      next();
    };
  }

  return rateLimit({
    ...config,
    handler: (req, res, next) => {
      const error = new Error('Too many requests, please try again later');
      error.statusCode = 429;
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.details = {
        limit: config.max,
        window: config.windowMs,
        retryAfter: Math.round(config.windowMs / 1000)
      };
      next(error);
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * General API rate limiter
 */
export const apiLimiter = createRateLimiter(rateLimitConfig.api);

/**
 * Authentication rate limiters
 */
export const loginLimiter = createRateLimiter(rateLimitConfig.auth.login);
export const registerLimiter = createRateLimiter(rateLimitConfig.auth.register);
export const refreshLimiter = createRateLimiter(rateLimitConfig.auth.refresh);

/**
 * Strict rate limiter for sensitive operations
 */
export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password reset rate limiter
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Profile update rate limiter
 */
export const profileUpdateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 profile updates per minute
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Search rate limiter
 */
export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 search requests per minute
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Progressive rate limiter that increases restrictions based on violations
 */
export const progressiveLimiter = () => {
  // Skip rate limiting in development mode
  if (shouldSkipRateLimit()) {
    return (req, res, next) => {
      console.log(`🔓 Progressive rate limiting skipped for ${req.method} ${req.path} (development mode)`);
      next();
    };
  }

  const violations = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    // Get violation history for this IP
    let ipViolations = violations.get(ip) || [];
    
    // Remove old violations outside the window
    ipViolations = ipViolations.filter(time => now - time < 24 * 60 * 60 * 1000); // 24 hours
    
    // Calculate progressive limit based on violations
    const baseLimit = 100;
    const violationCount = ipViolations.length;
    const progressiveLimit = Math.max(10, baseLimit - (violationCount * 20));
    
    // Create dynamic rate limiter
    const dynamicLimiter = createRateLimiter({
      windowMs,
      max: progressiveLimit,
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
      onLimitReached: () => {
        // Record violation
        ipViolations.push(now);
        violations.set(ip, ipViolations);
      }
    });
    
    dynamicLimiter(req, res, next);
  };
};

/**
 * IP-based rate limiter with whitelist
 */
export const ipLimiter = (whitelist = []) => {
  return (req, res, next) => {
    // Skip rate limiting in development mode
    if (shouldSkipRateLimit()) {
      console.log(`🔓 IP rate limiting skipped for ${req.method} ${req.path} (development mode)`);
      return next();
    }

    const ip = req.ip;

    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(ip)) {
      return next();
    }

    // Apply standard API rate limiting
    apiLimiter(req, res, next);
  };
};

/**
 * User-based rate limiter (requires authentication)
 */
export const userLimiter = (config) => {
  // Skip rate limiting in development mode
  if (shouldSkipRateLimit()) {
    return (req, res, next) => {
      console.log(`🔓 User rate limiting skipped for ${req.method} ${req.path} (development mode)`);
      next();
    };
  }

  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowMs = config.windowMs || 60 * 1000;
    const maxRequests = config.max || 60;
    
    // Get user's request history
    let requests = userRequests.get(userId) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(time => now - time < windowMs);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      const error = new Error('User rate limit exceeded');
      error.statusCode = 429;
      error.code = 'USER_RATE_LIMIT_EXCEEDED';
      error.details = {
        limit: maxRequests,
        window: windowMs,
        retryAfter: Math.round(windowMs / 1000)
      };
      return next(error);
    }
    
    // Add current request
    requests.push(now);
    userRequests.set(userId, requests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours
      for (const [key, value] of userRequests.entries()) {
        const filtered = value.filter(time => time > cutoff);
        if (filtered.length === 0) {
          userRequests.delete(key);
        } else {
          userRequests.set(key, filtered);
        }
      }
    }
    
    next();
  };
};

/**
 * Endpoint-specific rate limiter
 */
export const endpointLimiter = (endpoint, config) => {
  // Skip rate limiting in development mode
  if (shouldSkipRateLimit()) {
    return (req, res, next) => {
      console.log(`🔓 Endpoint rate limiting skipped for ${req.method} ${req.path} (development mode)`);
      next();
    };
  }

  const endpointRequests = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${endpoint}`;
    const now = Date.now();
    const windowMs = config.windowMs || 60 * 1000;
    const maxRequests = config.max || 10;
    
    // Get endpoint-specific request history
    let requests = endpointRequests.get(key) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(time => now - time < windowMs);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      const error = new Error(`Rate limit exceeded for ${endpoint}`);
      error.statusCode = 429;
      error.code = 'ENDPOINT_RATE_LIMIT_EXCEEDED';
      error.details = {
        endpoint,
        limit: maxRequests,
        window: windowMs,
        retryAfter: Math.round(windowMs / 1000)
      };
      return next(error);
    }
    
    // Add current request
    requests.push(now);
    endpointRequests.set(key, requests);
    
    next();
  };
};

export default {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  strictLimiter,
  passwordResetLimiter,
  profileUpdateLimiter,
  searchLimiter,
  progressiveLimiter,
  ipLimiter,
  userLimiter,
  endpointLimiter
};
