const express = require("express");
const {
  test
} = require("../../controller/Test/testController");

const testRouter = express.Router();

// Post/api/v1/token/refreshtoken
testRouter.get("/", test);


module.exports = testRouter;
