const { verifyRefreshToken } = require("../../util/verifyRefreshToken");
const { gererateToken } = require("../../util/generateToken");
const { sendError, sendResponse } = require("../../util/api-handler");

const genrateTokensFromRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const isVerified = await verifyRefreshToken({ refreshToken });
    if (isVerified.data) {
      const { accessToken, refreshToken, expiresIn } = await gererateToken({
        id: isVerified.data,
      });
      const data = {
        accessToken,
        refreshToken,
        expiresIn,
      }
      return sendResponse(res, 200, data)
    } else {
      return sendError(res, 401, "Invalid refresh token")
    }
  } catch (error) {
    return sendError(res,500, "Internal Server Error")
  }
};

module.exports = {
  genrateTokensFromRefreshToken,
};
