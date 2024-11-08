const express = require("express");
const {
  userAuthenticate,
  registerUser,
  getUsers,
  updateUserInfo,
} = require("../../controller/Users/usersController");
const upload = require("../../middleware/multer");

const userRouter = express.Router();

// Post/api/v1/users/register
userRouter.post("/register", registerUser);

// Post/api/v1/users/login
userRouter.post("/login", userAuthenticate);

// Get/api/v1/users
userRouter.get("/", getUsers);

// Put/api/v1/users/editprofile
userRouter.put("/editprofile/:userId", upload.single('profilePic'), updateUserInfo);

module.exports = userRouter;
