import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdatePreferences,
  validateSearch
} from '../middleware/validation.js';
import {
  profileUpdateLimiter,
  strictLimiter,
  searchLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  authenticate,
  userController.getProfile
);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  profileUpdateLimiter,
  validateUpdateProfile,
  userController.updateProfile
);

/**
 * @route   PUT /api/user/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password',
  authenticate,
  strictLimiter,
  validateChangePassword,
  userController.changePassword
);

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences',
  authenticate,
  userController.getPreferences
);

/**
 * @route   PUT /api/user/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences',
  authenticate,
  profileUpdateLimiter,
  validateUpdatePreferences,
  userController.updatePreferences
);

/**
 * @route   GET /api/user/devices
 * @desc    Get user's active devices/sessions
 * @access  Private
 */
router.get('/devices',
  authenticate,
  userController.getDevices
);

/**
 * @route   DELETE /api/user/devices/:deviceId
 * @desc    Remove a specific device/session
 * @access  Private
 */
router.delete('/devices/:deviceId',
  authenticate,
  strictLimiter,
  userController.removeDevice
);

/**
 * @route   GET /api/user/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search',
  authenticate,
  searchLimiter,
  validateSearch,
  userController.searchUsers
);

/**
 * @route   GET /api/user/:userId
 * @desc    Get user by ID (public profile)
 * @access  Public (with optional auth)
 */
router.get('/:userId',
  optionalAuth,
  userController.getUserById
);

export default router;
