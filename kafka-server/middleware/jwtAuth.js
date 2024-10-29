const jwt = require("jsonwebtoken");
const config = require("../config/development.json");
const { sendError } = require("../util/api-handler");
const { ObjectId } = require("mongodb");

async function protect(req, res, next) {
  if (req.path !== "/health") {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, config.JWTConfig.secretKey, async (err, decoded) => {
        if (err) {
          return sendError(res, 401, "Invalid token");
        }

        try {
          const userId = ObjectId.isValid(decoded.data)
            ? new ObjectId(decoded.data)
            : null;
          if (!userId) {
            return sendError(res, 400, "Invalid user ID format in token");
          }

          req.user = await global.dbConnection
            .collection("users")
            .findOne({ _id: userId }, { projection: { passwords: 0 } });

          if (!req.user) {
            return sendError(res, 404, "User not found");
          }
          next();
        } catch (error) {
          console.error("Error fetching user:", error);
          return sendError(res, 500, "Internal server error");
        }
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
