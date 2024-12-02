const Chat = require("../../model/Chat/Chat");
const User = require("../../model/User/User");
const { sendError, sendResponse } = require("../../util/api-handler");

const accessChat = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return sendError(res, 400, "userId is not provided");
    }
    let isChat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (isChat.length > 0) {
      return sendResponse(res, 200, isChat);
    } else {
      const chatData = {
        chatName: "sender",
        users: [req.user._id, userId],
      };
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      return sendResponse(res, 200, FullChat);
    }
  } catch (error) {
    return sendError(res, 500, "Internal server error", error);
  }
};

const fetchAllChats = async (req, res) => {
  try {
    const { user } = req;
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: user._id } },
    })
      .populate("users", "-password -profilePic")  // Exclude password and profilePic correctly
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email",  // Select only name and email for the sender
    });

    return sendResponse(res, 200, chats);
  } catch (error) {
    return sendError(res, 500, "Internal server error", error);
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log('\n\n[+]: deleteChat -> chatId', chatId);
    if (!chatId) {
      return sendError(res, 400, "chatId is not provided");
    }
    const chat = await Chat.findOne({
      _id: chatId
    })
    if (!chat) {
      return sendError(res, 404, 'Chat not found');
    }
    await Chat.deleteOne({
      _id: chatId
    })
    return sendResponse(res, 200, 'deleted');
  } catch (error) {
    return sendError(res, 500, "Internal server error", error);
  }
}

module.exports = {
  accessChat,
  fetchAllChats,
  deleteChat
};
