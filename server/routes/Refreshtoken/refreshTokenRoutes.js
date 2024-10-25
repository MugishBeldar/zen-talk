const express = require("express");
const {
  genrateTokensFromRefreshToken
} = require("../../controller/Refreshtoken/refreshTokenController");

const refreshTokenRouter = express.Router();

// Post/api/v1/token/refreshtoken
refreshTokenRouter.post("/refreshtoken", genrateTokensFromRefreshToken);


module.exports = refreshTokenRouter;
