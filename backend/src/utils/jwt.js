import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { jwtConfig } from '../config/index.js';

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} - Signed JWT token
 */
export const generateAccessToken = (payload) => {
  const tokenPayload = {
    sub: payload.userId,
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    iss: jwtConfig.issuer,
    aud: jwtConfig.audience
  };

  return jwt.sign(tokenPayload, jwtConfig.privateKey, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.accessTokenExpiry
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} - Signed JWT token
 */
export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    sub: payload.userId,
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
    type: 'refresh',
    jti: uuidv4(), // Unique token ID for tracking
    iat: Math.floor(Date.now() / 1000),
    iss: jwtConfig.issuer,
    aud: jwtConfig.audience
  };

  return jwt.sign(tokenPayload, jwtConfig.privateKey, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.refreshTokenExpiry
  });
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} - Token pair with expiry info
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Calculate expiry time in seconds
  const expiresIn = jwt.decode(accessToken).exp - Math.floor(Date.now() / 1000);
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer'
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} tokenType - Type of token ('access' or 'refresh')
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token, tokenType = 'access') => {
  try {
    const decoded = jwt.verify(token, jwtConfig.publicKey, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
    
    // Verify token type
    if (decoded.type !== tokenType) {
      throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw error;
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiry date or null if invalid
 */
export const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Get time remaining until token expires
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiry, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;
    
    return Math.max(0, timeRemaining);
  } catch (error) {
    return 0;
  }
};

/**
 * Hash token for storage
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate device ID from device info
 * @param {Object} deviceInfo - Device information
 * @returns {string} - Unique device ID
 */
export const generateDeviceId = (deviceInfo) => {
  const deviceString = `${deviceInfo.userAgent}-${deviceInfo.ip}-${deviceInfo.platform}`;
  return crypto.createHash('md5').update(deviceString).digest('hex');
};

/**
 * Generate session ID
 * @returns {string} - Unique session ID
 */
export const generateSessionId = () => {
  return `sess_${uuidv4()}`;
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Validate token format
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token format is valid
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Get token info for debugging
 * @param {string} token - JWT token
 * @returns {Object} - Token information
 */
export const getTokenInfo = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;
    const timeRemaining = Math.max(0, decoded.exp - currentTime);
    
    return {
      valid: true,
      type: decoded.type,
      userId: decoded.sub,
      sessionId: decoded.sessionId,
      deviceId: decoded.deviceId,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
      isExpired,
      timeRemaining
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  getTokenTimeRemaining,
  hashToken,
  generateDeviceId,
  generateSessionId,
  extractTokenFromHeader,
  isValidTokenFormat,
  getTokenInfo
};
