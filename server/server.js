const app = require("./app");
const config = require("./config");
const port = global.isNewHopeInstance ? 4040 : config.server.port;
const io = require("socket.io");
const server = require("http").Server(app);

try {
  const createdServer = server.listen(port, config.server.host, function () {
    console.log("------------- App running on port", port);
  });

  const ioInstance = io(createdServer, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userInfo) => {
      socket.join(userInfo.ID);
      socket.emit("connected");
    });

    socket.on("joinChat", (selectedChatId) => {
      console.log("🚀 ~ socket.on ~ selectedChatId:", selectedChatId)
      socket.join(selectedChatId);
    });

    socket.on("send", (response) => {
      const userChat = response?.chat;
      if (!userChat.users) return console.log("user not defined in chat");
      userChat.users.forEach((user) => {
        if (user._id === response.sender._id) {
          console.log(true, "sender user");
        }
      });
      console.log("🚀 ~ userChat.users.forEach ~ userChat._id:", userChat._id)
      socket.in(userChat._id).emit("recived", response);
    });
  });
} catch (error) {
  console.error("Error starting the server:", error);
}
