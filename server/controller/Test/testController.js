const { sendResponse } = require("../../util/api-handler");

const test = (req, res) => {
  return sendResponse(res, 200);
}

module.exports = Object.freeze({
  test
})