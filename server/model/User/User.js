const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Create schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    profilePic: { type: String },
  },
  { timestamps: true }
);

// Compile the user model
const User = mongoose.model("User", UserSchema);

module.exports = User;
