require("dotenv").config();
require("./config/dbConnet");
const { protect } = require("./middleware/jwtAuth");
const express = require("express");
const cors = require("cors");
const io = require("socket.io");
const userRouter = require("./routes/Users/userRoutes");
const chatRouter = require("./routes/Chats/chatRoutes");
const messageRouter = require("./routes/Messages/messageRoutes");
const refreshTokenRouter = require("./routes/Refreshtoken/refreshTokenRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads
app.use(protect);

//---------
// Routes
//---------

// Refreshtoken route 
app.use("/api/v1/token/", refreshTokenRouter);

// User route
app.use("/api/v1/users/", userRouter);

// Chat route
app.use("/api/v1/chats/", chatRouter);

// Message route
app.use("/api/v1/messages/", messageRouter);

//Lister to server

const PORT = process.env.PORT || 5000;
const createdServer = app.listen(
  PORT,
  console.log(`Server is up and running on ${PORT}`)
);

const corsOptions = {
  origin: "http://localhost:3001", // Allow requests from this origin
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Allow all methods
};

const ioInstance = io(createdServer, {
  pingTimeout: 60000,
  cors: corsOptions, // Set CORS options for Socket.IO server
});

ioInstance.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userInfo) => {
    socket.join(userInfo.ID);
    socket.emit("connected");
  });

  socket.on("joinChat", (selectedChatId) => {
    console.log("🚀 ~ socket.on ~ selectedChatId:", selectedChatId);
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
    console.log("🚀 ~ userChat.users.forEach ~ userChat._id:", userChat._id);
    socket.in(userChat._id).emit("recived", response);
  });
});
