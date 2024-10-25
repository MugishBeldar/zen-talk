const jwt = require("jsonwebtoken");
const config = require('../config/development.json');

/**
 * Generates JWT tokens for user authentication.
 * @param {object} id - User ID to be included in the token data.
 * @returns {Promise<object>} Object containing accessToken, refreshToken, and expiresIn.
 */
async function gererateToken({ id }) {
  const accessToken = jwt.sign(
    { data: id },
    config.JWTConfig.secretKey,
    { expiresIn: config.JWTConfig.accessTokenLife }
  );
  const refreshToken = jwt.sign(
    { data: id },
    config.JWTConfig.secretKey,
    { expiresIn: config.JWTConfig.refreshTokenLife }
  );
  return { accessToken, refreshToken, expiresIn: 3600 };
}

module.exports = {
  gererateToken,
};
