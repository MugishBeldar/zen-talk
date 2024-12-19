const Call = require("../../model/Call/Call");
const Message = require("../../model/messages/Message");
const { sendError, sendResponse } = require("../../util/api-handler");
const { ObjectId } = require('mongodb')

const createCall = async (req, res) => {
  try {
    const { receiver, callDuration, callStates, chatId } = req.body;
    if (!receiver || !callDuration || !callStates || !chatId) {
      return sendError(res, 400, "caller, receiver, callDuration, callStates and chatId is required");
    }
    const callObj = {
      caller: req.user._id,
      receiver,
      callDuration,
      callStates,
    };
    var call = await Call.create(callObj);
    console.log('\n\n[+]: createCall -> call', call);
    const msgObj = {
      sender: new ObjectId(req.user._id),
      content: 'call',
      chat: new ObjectId(chatId),
      isCall: true,
      call: call._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    var message = await Message.create(msgObj);
    console.log('\n\n[+]: createCall -> message', message);
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
