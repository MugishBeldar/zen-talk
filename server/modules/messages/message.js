class Message {
  async createMessage(req, res) {
    try {
      const { App } = req;
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
      };
      var message = await App.activeDB.Message.create(newMessage);
      var messageQuery = await App.activeDB.Message.findOne({
        _id: message._id,
      });

      message = await messageQuery.populate("sender", "name pic");
      message = await messageQuery.populate("chat");
      message = await App.activeDB.User.populate(message, {
        path: "chat.users",
        select: "name profilePic email",
      });

      await App.activeDB.Chat.findByIdAndUpdate(req.body.chatId, {
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

  async allMessages(req, res) {
    try {
      const { App } = req;
      const { chatId } = req.params;
      if (!chatId) {
        return res.status(400).json({
          success: false,
          message: "Please provide chatId",
        });
      }
      let messages = await App.activeDB.Message.find({
        chat: req.params.chatId,
      })
        .populate("sender", "name pic email")
        .populate("chat");
        messages = await App.activeDB.User.populate(messages, {
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
}

module.exports = new Message();
