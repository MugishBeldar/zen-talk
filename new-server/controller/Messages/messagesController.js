const Chat = require("../../model/Chat/Chat");
const Message = require("../../model/messages/Message");
const User = require('../../model/User/User');
const moment = require('moment-timezone');

const createMessage = async (req, res) => {
    try {
      const { content, chatId } = req.body;

      if (!content || !chatId) {
        return res.status(400).json({
          success: false,
          message: "Please provide content and chatId",
        });
      }

      var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        createdAt:  moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
        updatedAt:  moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
      };
      var message = await Message.create(newMessage);
      var messageQuery = await Message.findOne({
        _id: message._id,
      });

      message = await messageQuery.populate("sender", "name pic");
      message = await messageQuery.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name profilePic email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });

      return res.status(201).json({
        success: true,
        message: "Message Created",
        data: message,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        type: "internal error",
      });
    }
  }

const allMessages = async (req, res) => {
    try {
      const { chatId } = req.params;
      if (!chatId) {
        return res.status(400).json({
          success: false,
          message: "Please provide chatId",
        });
      }
      let messages = await Message.find({
        chat: req.params.chatId,
      })
        .populate("sender", "name pic email")
        .populate("chat");
      messages = await User.populate(messages, {
        path: "chat.users",
        select: "name profilePic email",
      });
      return res.status(200).json({
        success: true,
        message: "fetched messages",
        data: messages,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        type: "internal error",
      });
    }
  }

  module.exports = {
    createMessage,
    allMessages
  };