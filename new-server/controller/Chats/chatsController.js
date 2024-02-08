const Chat = require("../../model/Chat/Chat");
const User = require("../../model/User/User");

const accessChat = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
        type: "validation error",
      });
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
      return res.status(200).json({
        success: true,
        message: "fetched chats",
        data: isChat,
      });
    } else {
      const chatData = {
        chatName: "sender",
        users: [req.user._id, userId],
      };
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      return res.status(200).json({
        success: true,
        message: "fetched created chats",
        data: FullChat,
      });
    }
  } catch (error) {
    console.log("error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const fetchAllChats = async (req, res) => {
  try {
    const { user } = req;
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chats = await User.populate(chats, {
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
};
module.exports = {
  accessChat,
  fetchAllChats,
};
