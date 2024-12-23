const Call = require("../../model/Call/Call");
const Message = require("../../model/messages/Message");
const { sendError, sendResponse } = require("../../util/api-handler");
const { ObjectId } = require('mongodb')

const createCall = async (req, res) => {
  try {
    const { caller, receiver, callDuration, callStates, chatId } = req.body;
    if (!caller, !receiver || callDuration < 0 || !callStates || !chatId) {
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

// 674d4923c2e2117c82e0b6fe
const getCallLogs = async (req, res) => {
  try {
    let {
      userId,
      sortBy = "createdAt",
      sortOrder = "DESC",
      startRecord = 0,
      endRecord = 20,
    } = req.query;

    // Convert string inputs to numbers and validate
    const rows = parseInt(endRecord) || 20;
    const offset = parseInt(startRecord) || 0;
    const sortDirection = sortOrder.toUpperCase() === "DESC" ? -1 : 1;

    // Validate and create the filter
    const filter = userId
      ? { $or: [{ caller: new ObjectId(userId) }, { receiver: new ObjectId(userId) }] }
      : {};

    const logs = await Call.find(filter)
      .populate("caller", "name profilePic email")
      .populate("receiver", "name profilePic")
      .populate('callMessage')
      .sort({ [sortBy]: sortDirection })
      .skip(offset)
      .limit(rows);

    // Fetch the total record count
    const totalRecords = await Call.countDocuments(filter);

    return res.status(200).json({
      data: logs,
      totalRecords,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};



module.exports = {
  createCall,
  getCallLogs
};
