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

  async protect(req, res, next) {
    console.log("🚀 ~ JwntAuth ~ protect ~ req.path:", req.path)
    console.log(req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ") &&
      req.path !== "/login" &&
      req.path !== "/signup","::")
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ") &&
      req.path !== "/login" &&
      req.path !== "/signup"
    ) {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(
        token,
        global.CONFIG.JWTConfig.secretKey,
        async (err, decoded) => {
          if (err) {
            return res.status(401).json({
              success: false,
              message: "Invalid token",
              type: "invalid token",
            });
          }
          req.user = await req.App.activeDB.User.findById(decoded.data).select(
            "-passwords"
          );
          next();
        }
      );
    } else {
      next();
    }
  }
}

module.exports = new JwntAuth();
