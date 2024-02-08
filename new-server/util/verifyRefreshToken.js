const jwt = require("jsonwebtoken");
const config = require("../config/development.json");

async function verifyRefreshToken({ refreshToken }) {
  //   const accessToken = jwt.sign(
  //     { data: id },
  //     config.JWTConfig.secretKey,
  //     { expiresIn: config.JWTConfig.accessTokenLife }
  //   );
  //   const refreshToken = jwt.sign(
  //     { data: id },
  //     config.JWTConfig.secretKey,
  //     { expiresIn: config.JWTConfig.refreshTokenLife }
  //   );
  //   return { accessToken, refreshToken, expiresIn: 3600 };
  try {
    const isVerified = jwt.verify(refreshToken, config.JWTConfig.secretKey);
    // console.log(isVerified, "verified...");
    return isVerified;
  } catch (error) {
    console.log(error.message); // jwt malformed
    return 'invalid refreshtoken'
  }
}

module.exports = {
  verifyRefreshToken,
};
