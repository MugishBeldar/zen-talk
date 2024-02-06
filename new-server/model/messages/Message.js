const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const MessageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, trim: true },
  readby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  createdAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
  updatedAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
});

// Compile the message model
const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
