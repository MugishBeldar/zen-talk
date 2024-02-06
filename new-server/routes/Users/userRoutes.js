const express = require("express");
const { userAuthenticate, registerUser } = require("../../controller/Users/usersController");
const { protect } = require("../../middleware/jwtAuth");

const userRouter = express.Router();

// Post/api/v1/users/login
userRouter.post('/register', registerUser);
userRouter.post("/login", userAuthenticate);

module.exports = userRouter;
