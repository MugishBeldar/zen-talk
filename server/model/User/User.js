const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  profilePic: { type: String },
  createdAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
  updatedAt: {
    type: String,
    default: moment.tz("Asia/Calcutta").format("dddd DD-MM-YYYY hh:mm:ss A "),
  },
});

// Compile the user model
const User = mongoose.model('User', UserSchema);

module.exports = User;