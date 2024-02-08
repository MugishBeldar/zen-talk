const express = require("express");
const { createMessage, allMessages } = require("../../controller/Messages/messagesController");

const messageRouter = express.Router();

// Post/api/v1/messages 
messageRouter.post("/", createMessage);

// Get/api/v1/messages/:chatId
messageRouter.get("/:chatId", allMessages);

module.exports = messageRouter;
