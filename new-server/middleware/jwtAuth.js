const jwt = require("jsonwebtoken");
const User = require("../model/User/User");
const config = require('../config/development.json');

/**
 * Middleware for protecting routes requiring user authentication.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next() function.
 */
async function protect(req, res, next) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ") &&
    req.path !== "/login" &&
    req.path !== "/signup"
  ) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(
      token,
      config.JWTConfig.secretKey,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid token",
            type: "invalid token",
          });
        }
        req.user = await User.findById(decoded.data).select("-passwords");
        next();
      }
    );
  } else {
    next();
  }
}

module.exports = {
  protect,
};
