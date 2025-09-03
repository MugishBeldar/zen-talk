import { User, RefreshToken, UserSession, UserPreferences } from '../models/index.js';
import { 
  NotFoundError, 
  ValidationError, 
  AuthenticationError,
  createSuccessResponse 
} from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const { user } = req;
  
  // Get full user data
  const userData = await User.findById(user.id).select('-password');
  if (!userData) {
    throw new NotFoundError('User');
  }
  
  // Get user statistics
  const stats = await User.getUserStats(user.id);
  
  const response = createSuccessResponse({
    user: userData.toJSON(),
    stats: stats[0] || {
      totalSessions: 0,
      lastLogin: null
    }
  });
  
  res.json(response);
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const updates = req.body;
  
  // Find and update user
  const userData = await User.findById(user.id);
  if (!userData) {
    throw new NotFoundError('User');
  }
  
  // Update allowed fields
  const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      userData[field] = updates[field];
    }
  });
  
  await userData.save();
  
  const response = createSuccessResponse({
    user: userData.toJSON()
  }, 'Profile updated successfully');
  
  res.json(response);
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;
  
  // Find user with password
  const userData = await User.findById(user.id);
  if (!userData) {
    throw new NotFoundError('User');
  }
  
  // Verify current password
  const isCurrentPasswordValid = await userData.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new ValidationError('Current password is incorrect', {
      currentPassword: 'Current password is incorrect'
    });
  }
  
  // Update password
  userData.password = newPassword;
  await userData.save();
  
  // Invalidate all refresh tokens except current session
  await RefreshToken.deactivateOtherUserTokens(user.id, null);
  
  // End other sessions
  await UserSession.endOtherUserSessions(user.id, user.sessionId);
  
  const response = createSuccessResponse({
    passwordChangedAt: new Date(),
    tokensInvalidated: true
  }, 'Password changed successfully');
  
  res.json(response);
});

/**
 * Get user preferences
 */
export const getPreferences = asyncHandler(async (req, res, next) => {
  const { user } = req;
  
  const preferences = await UserPreferences.getPreferencesWithDefaults(user.id);
  
  const response = createSuccessResponse({
    preferences: preferences.toJSON()
  });
  
  res.json(response);
});

/**
 * Update user preferences
 */
export const updatePreferences = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const updates = req.body;
  
  const preferences = await UserPreferences.updateUserPreferences(user.id, updates);
  
  const response = createSuccessResponse({
    preferences: preferences.toJSON()
  }, 'Preferences updated successfully');
  
  res.json(response);
});

/**
 * Get user's active devices/sessions
 */
export const getDevices = asyncHandler(async (req, res, next) => {
  const { user } = req;
  
  // Get active refresh tokens (devices)
  const devices = await RefreshToken.getUserActiveDevices(user.id);
  
  // Get current device ID for comparison
  const currentDeviceId = user.deviceId;
  
  // Format device information
  const formattedDevices = devices.map(device => ({
    deviceId: device._id.toString(),
    deviceInfo: device.deviceInfo,
    isCurrentDevice: device.deviceFingerprint === currentDeviceId,
    isActive: device.isActive,
    lastActivityAt: device.lastUsedAt,
    loginAt: device.createdAt
  }));
  
  const response = createSuccessResponse({
    devices: formattedDevices,
    totalDevices: formattedDevices.length,
    maxDevicesAllowed: 5
  });
  
  res.json(response);
});

/**
 * Remove a specific device/session
 */
export const removeDevice = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { deviceId } = req.params;
  
  // Find the device
  const device = await RefreshToken.findById(deviceId);
  if (!device || device.userId.toString() !== user.id) {
    throw new NotFoundError('Device not found or does not belong to user');
  }
  
  // Check if trying to remove current device
  if (device.deviceFingerprint === user.deviceId) {
    throw new ValidationError('Cannot remove the current device. Use logout instead.', {
      deviceId: 'Cannot remove current device'
    });
  }
  
  // Deactivate the device
  await device.deactivate();
  
  // End associated sessions
  await UserSession.updateMany(
    { userId: user.id, 'deviceInfo.userAgent': device.deviceInfo.userAgent },
    { isActive: false, logoutAt: new Date() }
  );
  
  const response = createSuccessResponse({
    deviceId,
    removedAt: new Date()
  }, 'Device removed successfully');
  
  res.json(response);
});

/**
 * Search users (for future features)
 */
export const searchUsers = asyncHandler(async (req, res, next) => {
  const { q, limit = 10, offset = 0 } = req.query;
  
  // Create search query
  const searchQuery = {
    $and: [
      { isActive: true },
      {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  };
  
  // Execute search
  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .select('username firstName lastName avatar bio status isEmailVerified')
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ username: 1 }),
    User.countDocuments(searchQuery)
  ]);
  
  const response = createSuccessResponse({
    users: users.map(user => user.toJSON()),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + limit < total
    }
  });
  
  res.json(response);
});

/**
 * Get user by ID (public profile)
 */
export const getUserById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  
  const user = await User.findOne({ 
    _id: userId, 
    isActive: true 
  }).select('username firstName lastName avatar bio status isEmailVerified createdAt');
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // Check privacy settings
  const preferences = await UserPreferences.findOne({ userId });
  const profileVisibility = preferences?.privacy?.profileVisibility || 'public';
  
  // For now, only return public profiles
  if (profileVisibility !== 'public') {
    throw new NotFoundError('User profile is private');
  }
  
  const response = createSuccessResponse({
    user: user.toJSON()
  });
  
  res.json(response);
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  getDevices,
  removeDevice,
  searchUsers,
  getUserById
};
