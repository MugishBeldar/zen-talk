const Chat = require("../../model/Chat/Chat");
const Message = require("../../model/messages/Message");
const User = require("../../model/User/User");
const { sendError, sendResponse } = require("../../util/api-handler");

// const createMessage = async (req, res) => {
//     try {
//       const { content, chatId } = req.body;

//       if (!content || !chatId) {
//         return sendError(res, 400, "content and chatId is required");
//       }

//       var newMessage = {
//         sender: req.user._id,
//         content: content,
//         chat: chatId,
//         createdAt:  moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
//         updatedAt:  moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
//       };
//       var message = await Message.create(newMessage);
//       var messageQuery = await Message.findOne({
//         _id: message._id,
//       });

//       message = await messageQuery.populate("sender", "name pic");
//       message = await messageQuery.populate("chat");
//       message = await User.populate(message, {
//         path: "chat.users",
//         select: "name profilePic email",
//       });

//       await Chat.findByIdAndUpdate(req.body.chatId, {
//         latestMessage: message,
//       });
//       return sendResponse(res, 201, message)
//     } catch (error) {
//       return sendError(res, 500, 'Internal Server Error', error)
//     }
//   }

const allMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return sendError(res, 400, "chatId is required");
    }
    let messages = await Message.find({ chat: req.params.chatId.trim() })
      .populate("sender", "name pic email")
      .populate("chat", "users")
      .sort({ createdAt: 1 });

    return sendResponse(res, 200, messages);
  } catch (error) {
    return sendError(res, 500, "Internal server error", error);
  }
};

module.exports = {
  // createMessage,
  allMessages,
};
