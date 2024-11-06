const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const MessageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, trim: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });  

// Compile the message model
const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
