const Call = require("../../model/Call/Call");
const Message = require("../../model/messages/Message");
const { sendError, sendResponse } = require("../../util/api-handler");
const { ObjectId } = require('mongodb')

const createCall = async (req, res) => {
  try {
    const { caller, receiver, callDuration, callStates, chatId } = req.body;
    if (!caller, !receiver || !callDuration || !callStates || !chatId) {
      return sendError(res, 400, "caller, receiver, callDuration, callStates and chatId is required");
    }
    const callObj = {
      caller,
      receiver,
      callDuration,
      callStates,
    };
    var call = await Call.create(callObj);
    const msgObj = {
      sender: caller,
      content: 'call',
      chat: new ObjectId(chatId),
      isCall: true,
      call: call._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    var message = await Message.create(msgObj);
    // Update the call document with the reference to the message
    call.callMessage = message._id;
    await call.save(); // Save the updated call
    return sendResponse(res, 200, { call });
  } catch (error) {
    return sendError(res, 500, "Internal Server Error")
  }
};

module.exports = {
  createCall,
};
