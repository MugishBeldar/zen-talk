const express = require("express");
const { accessChat, fetchAllChats, deleteChat } = require("../../controller/Chats/chatsController");

const chatRouter = express.Router();

// Post/api/v1/chats  // for created new chat or already chat created with selected user then return it
chatRouter.post("/", accessChat);

// Get/api/v1/chats
chatRouter.get("/", fetchAllChats);

// Delete/api/v1/chats/:chatId
chatRouter.delete("/:chatId", deleteChat);

module.exports = chatRouter;
