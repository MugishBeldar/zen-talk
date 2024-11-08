class ApiResponse {
  constructor(statusCode, data) {
    this.statusCode = statusCode;
    this.data = data ? data : null;
    this.success = statusCode < 400; // Success if status is under 400
  }

  sendResponse(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      data: this.data ? this.data : null,
    });
  }
}

module.exports = ApiResponse;
