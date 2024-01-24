const jwt = require("jsonwebtoken");
class JwntAuth {
  // eslint-disable-next-line no-useless-constructor
  constructor() {}
  async gererateToken({ id }) {
    const accessToken = jwt.sign(
      { data: id },
      global.CONFIG.JWTConfig.secretKey,
      { expiresIn: global.CONFIG.JWTConfig.accessTokenLife }
    );
    const refreshToken = jwt.sign(
      { data: id },
      global.CONFIG.JWTConfig.secretKey,
      { expiresIn: global.CONFIG.JWTConfig.refreshTokenLife }
    );
    return { accessToken, refreshToken, expiresIn: 3600 };
  }
}

module.exports = JwntAuth;