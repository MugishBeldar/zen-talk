import { User, RefreshToken, UserSession, UserPreferences } from '../models/index.js';
import { generateTokenPair, generateDeviceId, generateSessionId, hashToken } from '../utils/jwt.js';
import { getDeviceInfo } from '../utils/deviceDetection.js';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
  createSuccessResponse
} from '../utils/errors.js';
import { securityConfig } from '../config/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username }
      ]
    });
    
    if (existingUser) {
      const conflictField = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      throw new ConflictError(`User with this ${conflictField} already exists`, {
        field: conflictField,
        value: conflictField === 'email' ? email : username
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName
    });
    
    await user.save();
    
    // Create default preferences
    await UserPreferences.createDefaultForUser(user._id);
    
    // Get device information
    const deviceInfo = getDeviceInfo(req);
    const deviceId = generateDeviceId(deviceInfo);
    const sessionId = generateSessionId();
    
    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      sessionId,
      deviceId
    });
    
    // Create session
    const session = new UserSession({
      userId: user._id,
      sessionId,
      deviceInfo,
      isActive: true,
      loginAt: new Date(),
      lastActivityAt: new Date()
    });
    
    await session.save();
    
    // Store refresh token
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: hashToken(tokens.refreshToken),
      deviceInfo,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastUsedAt: new Date()
    });
    
    await refreshTokenDoc.save();
    
    // Return success response
    const response = createSuccessResponse({
      user: user.toJSON(),
      tokens,
      session: {
        sessionId,
        deviceInfo
      }
    }, 'User registered successfully', 201);
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Get device information
    const deviceInfo = getDeviceInfo(req);
    const deviceId = generateDeviceId(deviceInfo);
    const sessionId = generateSessionId();
    
    // Check device limit and remove oldest if needed
    await RefreshToken.removeOldestDeviceIfNeeded(
      user._id, 
      securityConfig.session.maxDevicesPerUser
    );
    
    // Generate tokens
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      sessionId,
      deviceId
    });
    
    // Create session
    const session = new UserSession({
      userId: user._id,
      sessionId,
      deviceInfo,
      isActive: true,
      loginAt: new Date(),
      lastActivityAt: new Date()
    });
    
    await session.save();
    
    // Store refresh token
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: hashToken(tokens.refreshToken),
      deviceInfo,
      isActive: true,
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date()
    });
    
    await refreshTokenDoc.save();
    
    // Update user status and last seen
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();
    
    // Return success response
    const response = createSuccessResponse({
      user: user.toJSON(),
      tokens,
      session: {
        sessionId,
        deviceInfo
      }
    }, 'Login successful');
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshTokenDoc, tokenPayload, user } = req;
    
    // Generate new access token
    const newTokens = generateTokenPair({
      userId: user.id,
      sessionId: tokenPayload.sessionId,
      deviceId: tokenPayload.deviceId
    });
    
    // Optionally rotate refresh token (recommended for security)
    const shouldRotateRefreshToken = true;
    
    if (shouldRotateRefreshToken) {
      // Deactivate old refresh token
      await refreshTokenDoc.deactivate();
      
      // Create new refresh token
      const newRefreshTokenDoc = new RefreshToken({
        userId: user.id,
        token: hashToken(newTokens.refreshToken),
        deviceInfo: refreshTokenDoc.deviceInfo,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastUsedAt: new Date()
      });
      
      await newRefreshTokenDoc.save();
    }
    
    // Return new tokens
    const response = createSuccessResponse({
      accessToken: newTokens.accessToken,
      refreshToken: shouldRotateRefreshToken ? newTokens.refreshToken : undefined,
      expiresIn: newTokens.expiresIn,
      tokenType: newTokens.tokenType
    }, 'Token refreshed successfully');
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from current device
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { user, session } = req;
    
    if (refreshToken) {
      // Deactivate the specific refresh token
      const hashedToken = hashToken(refreshToken);
      await RefreshToken.updateOne(
        { token: hashedToken, userId: user.id },
        { isActive: false }
      );
    } else {
      // Deactivate all refresh tokens for this session
      await RefreshToken.updateMany(
        { userId: user.id },
        { isActive: false }
      );
    }
    
    // End the session
    if (session) {
      await session.endSession();
    }
    
    // Update user status to offline if no other active sessions
    const activeSessions = await UserSession.getUserActiveSessions(user.id);
    if (activeSessions.length === 0) {
      const userDoc = await User.findById(user.id);
      if (userDoc) {
        userDoc.status = 'offline';
        userDoc.lastSeen = new Date();
        await userDoc.save();
      }
    }
    
    const response = createSuccessResponse(null, 'Logged out successfully');
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices
 */
export const logoutAll = async (req, res, next) => {
  try {
    const { user } = req;
    
    // Deactivate all refresh tokens
    const result = await RefreshToken.deactivateAllUserTokens(user.id);
    
    // End all sessions
    await UserSession.endAllUserSessions(user.id);
    
    // Update user status to offline
    const userDoc = await User.findById(user.id);
    if (userDoc) {
      userDoc.status = 'offline';
      userDoc.lastSeen = new Date();
      await userDoc.save();
    }
    
    const response = createSuccessResponse({
      devicesLoggedOut: result.modifiedCount
    }, 'Logged out from all devices successfully');
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token (for debugging/testing)
 */
export const verifyToken = async (req, res, next) => {
  try {
    const { user, session } = req;
    
    const response = createSuccessResponse({
      userId: user.id,
      sessionId: user.sessionId,
      deviceId: user.deviceId,
      isValid: true,
      session: {
        isActive: session.isActive,
        loginAt: session.loginAt,
        lastActivityAt: session.lastActivityAt
      }
    }, 'Token is valid');
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - Reset password with old password verification
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    });

    if (!user) {
      throw new ValidationError('If this email exists in our system, password reset instructions have been sent.', {
        email: 'Please contact ZenTalk customer support at support@zentalk.com if you continue to have issues.'
      });
    }

    // Verify old password
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new ValidationError('Current password is incorrect. Please contact customer support if you need assistance.', {
        oldPassword: 'Current password is incorrect',
        supportMessage: 'If you have forgotten your password, please contact ZenTalk customer support at support@zentalk.com'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens for security
    await RefreshToken.deactivateAllUserTokens(user._id);

    // End all sessions
    await UserSession.endAllUserSessions(user._id);

    // Update user status to offline
    user.status = 'offline';
    user.lastSeen = new Date();
    await user.save();

    const response = createSuccessResponse({
      passwordChanged: true,
      timestamp: new Date(),
      message: 'Password has been successfully updated. Please login with your new password.'
    }, 'Password reset successful');

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  verifyToken,
  forgotPassword
};
