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
  origin: "http://localhost:5173", // Allow requests from this origin https://zen-talk-hnkvfkpqh-mugishbeldars-projects.vercel.app/
  // origin: "https://zen-talk.vercel.app", // Allow requests from this origin https://zen-talk-hnkvfkpqh-mugishbeldars-projects.vercel.app/
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Allow all methods
};

const ioInstance = io(createdServer, {
  pingTimeout: 60000,
  cors: corsOptions, // Set CORS options for Socket.IO server
});

ioInstance.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // Listen for messages from clients
  socket.on("message", (data) => {
    console.log(data);

    // Broadcast the message to all other clients except the sender
    socket.emit("messageResponse", data); // This broadcasts to all other connected clients
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});
