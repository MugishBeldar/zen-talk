// utils/ApiError.js
class ApiError {
  constructor(statusCode, message = "Something went wrong", error = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.error = error;
    this.data = null;
  }

  sendResponse(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      statusCode: this.statusCode,
      error: this.error ? this.error.toString() : undefined,
      data: this.data,
    });
  }
}

module.exports = ApiError;
