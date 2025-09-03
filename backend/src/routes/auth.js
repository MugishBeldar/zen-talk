import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate, validateRefreshToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken as validateRefreshTokenBody,
  validateForgotPassword
} from '../middleware/validation.js';
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  strictLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  registerLimiter,
  validateRegister,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  loginLimiter,
  validateLogin,
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  refreshLimiter,
  validateRefreshTokenBody,
  validateRefreshToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout from current device
 * @access  Private
 */
router.post('/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all',
  authenticate,
  strictLimiter,
  authController.logoutAll
);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if access token is valid (for debugging)
 * @access  Private
 */
router.get('/verify-token',
  authenticate,
  authController.verifyToken
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Reset password with old password verification
 * @access  Public
 */
router.post('/forgot-password',
  strictLimiter,
  validateForgotPassword,
  authController.forgotPassword
);

export default router;
