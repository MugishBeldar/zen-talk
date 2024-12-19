const express = require("express");
const { createCall } = require("../../controller/Call/callController");

const callRouter = express.Router();

// Post/api/v1/call
callRouter.post("/", createCall);

// // Get/api/v1/chats
// chatRouter.get("/", fetchAllChats);

// // Delete/api/v1/chats/:chatId
// chatRouter.delete("/:chatId", deleteChat);

module.exports = callRouter;
