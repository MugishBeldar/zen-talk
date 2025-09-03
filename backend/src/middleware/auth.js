import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { AuthenticationError, TokenError } from '../utils/errors.js';
import { User, RefreshToken, UserSession } from '../models/index.js';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }
    
    // Verify the token
    const decoded = verifyToken(token, 'access');
    
    // Find the user
    const user = await User.findById(decoded.sub).select('-password');
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    // Find the session
    const session = await UserSession.findActiveSession(decoded.sessionId);
    if (!session) {
      throw new AuthenticationError('Session not found or expired');
    }
    
    // Update session activity
    await session.updateActivity();
    
    // Attach user and session info to request
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      sessionId: decoded.sessionId,
      deviceId: decoded.deviceId
    };
    
    req.session = session;
    
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return next(new TokenError('Access token has expired'));
    } else if (error.message.includes('invalid')) {
      return next(new TokenError('Invalid access token'));
    }
    next(error);
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Try to verify the token
    const decoded = verifyToken(token, 'access');
    const user = await User.findById(decoded.sub).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        sessionId: decoded.sessionId,
        deviceId: decoded.deviceId
      };
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const authorize = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return next(new AuthorizationError('Access denied to this resource'));
    }
    
    next();
  };
};

/**
 * Middleware to validate refresh token
 */
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new TokenError('Refresh token is required');
    }
    
    // Verify the refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Hash the token to find it in database
    const hashedToken = RefreshToken.hashToken(refreshToken);
    
    // Find the token in database
    const tokenDoc = await RefreshToken.findActiveToken(hashedToken);
    if (!tokenDoc) {
      throw new TokenError('Invalid or expired refresh token');
    }
    
    // Check if user is still active
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    // Update token last used time
    await tokenDoc.updateLastUsed();
    
    // Attach token info to request
    req.refreshTokenDoc = tokenDoc;
    req.tokenPayload = decoded;
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return next(new TokenError('Refresh token has expired'));
    } else if (error.message.includes('invalid')) {
      return next(new TokenError('Invalid refresh token'));
    }
    next(error);
  }
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  validateRefreshToken
};
