class Chat {

  async accessChat(req, res) {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the fields",
          type: "validation error",
        });
      }
      let isChat = await req.App.activeDB.Chat.find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users", "-password")
        .populate("latestMessage");
      isChat = await req.App.activeDB.User(isChat, {
        path: "latestMessage.sender",
        select: "name email profilePic",
      });
      if (isChat.length > 0) {
        return res.status(200).json({
          success: true,
          message: "fetched all chats",
          data: isChat,
        });
      } else {
        const chatData = {
          chatName: "sender",
          isGroupChat: false,
          users: [req.user._id, userId],
        };
        const createdChat = await req.App.activeDB.Chat.create(chatData);
        const FullChat = await req.App.activeDB.Chat.findOne({
          _id: createdChat._id,
        }).populate("users", "-password");
        return res.status(200).json({
          success: true,
          message: "fetched all full chats",
          data: FullChat,
        });
      }
    } catch (error) {
      console.log("🚀 ~ Chat ~ accessChat ~ error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

}

module.exports = new Chat();
