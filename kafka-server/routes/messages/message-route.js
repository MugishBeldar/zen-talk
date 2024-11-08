const express = require("express");
const { createMessage } = require("../../controller/messages/message-controller");

const messageRouter = express.Router();

// Post/api/v1/messages 
messageRouter.post("/", createMessage);

module.exports = messageRouter;
