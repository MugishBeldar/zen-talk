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
          message: "fetched chats",
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
          message: "fetched created chats",
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

  async fetchChats(req, res) {
    try {
      const { App, user } = req;
      let chats = await App.activeDB.Chat.find({
        users: { $elemMatch: { $eq: user._id } },
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password")
        .sort({ updatedAt: -1 });
      chats = await App.activeDB.User.populate(chats, {
        path: "latestMessage.sender",
        select: "name email profilePic",
      });
      return res.status(200).json({
        success: true,
        message: "fetched all chats",
        data: chats,
      });
    } catch (error) {
      console.log("Error:---", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async createGroupChat(req, res) {
    try {
      const { App, user } = req;
      if (!req.body.groupName) {
        return res.status(400).json({
          success: false,
          message: "please provide groupName",
        });
      }
      if (!req.body.users) {
        return res.status(400).json({
          success: false,
          message: "please provide users",
        });
      }
      let users = JSON.parse(req.body.users);
      if (users.length < 2) {
        return res.status(400).json({
          success: false,
          message: "please provide atleast 2 users",
        });
      }
      const groupCreated = await App.activeDB.Chat.create({
        chatName: req.body.groupName.trim(),
        isGroupChat: true,
        users,
        groupAdmin: user,
      });
      const fullGroupChat = await App.activeDB.Chat
        .findOne({
          _id: groupCreated._id,
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      return res.status(200).json({
        success: true,
        message: "fetched group created chats",
        data: fullGroupChat,
      });
    } catch (error) {
      console.log("Error:---", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = new Chat();
