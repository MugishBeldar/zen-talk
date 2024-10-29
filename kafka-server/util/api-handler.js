const ApiError = require("../hepler/ApiError");
const ApiResponse = require("../hepler/ApiResponse");

function sendError(res, statusCode, message, error = null) {
  console.log("File:-- api-handler.js, Line:-- 5 , error===> ", error);
  const apiError = new ApiError(statusCode, message, error);
  apiError.sendResponse(res);
}

function sendResponse(res, statusCode, data, message = "Success") {
  const apiResponse = new ApiResponse(statusCode, data, message);
  apiResponse.sendResponse(res);
}

module.exports = Object.freeze({
  sendError,
  sendResponse,
});
