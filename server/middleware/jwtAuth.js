const jwt = require("jsonwebtoken");
const User = require("../model/User/User");
const config = require("../config/development.json");
const { sendError } = require("../util/api-handler");

/**
 * Middleware for protecting routes requiring user authentication.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next() function.
 */
async function protect(req, res, next) {
  console.log(req.path);
  if (
    req.path !== "/" &&
    req.path !== "/api/v1/users/login" &&
    req.path !== "/api/v1/users/register" &&
    req.path !== "/api/v1/token/refreshtoken"
  ) {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, config.JWTConfig.secretKey, async (err, decoded) => {
        if (err) {
          return sendError(res, 401, "Invalid token");
        }
        req.user = await User.findById(decoded.data).select("-passwords");
        next();
      });
    } else {
      return sendError(res, 401, "Invalid token");
    }
  } else {
    next();
  }
}

module.exports = {
  protect,
};
