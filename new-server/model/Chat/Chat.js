const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const ChatSchema = new mongoose.Schema({
  chatName: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
  updatedAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
});

// Compile the chat model
const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
