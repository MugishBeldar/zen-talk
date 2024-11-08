const mongoose = require("mongoose");

// Create schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    profilePic: { type: Buffer },
  },
  { timestamps: true }
);

// Compile the user model
const User = mongoose.model("User", UserSchema);

module.exports = User;
