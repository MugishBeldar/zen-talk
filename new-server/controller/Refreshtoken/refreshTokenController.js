const { verifyRefreshToken } = require("../../util/verifyRefreshToken");
const { gererateToken } = require("../../util/generateToken");

const genrateTokensFromRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const isVerified = await verifyRefreshToken({ refreshToken });
    console.log(isVerified);
    if (isVerified.data) {
      const { accessToken, refreshToken, expiresIn } = await gererateToken({
        id: isVerified.data,
      });
      return res.status(200).json({
        success: true,
        message: "Tokens generated successfully",
        data: {
          accessToken,
          refreshToken,
          expiresIn,
        },
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refreshtoken" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      type: "internal error",
    });
  }
};

module.exports = {
  genrateTokensFromRefreshToken,
};
