const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const ChatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// Compile the chat model
const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
