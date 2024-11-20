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
const apiWrapper = require("./external-api-call/api-wrapper");
const { pub, sub } = require('./services/redis');

// Move the Redis subscription outside the connection logic to avoid adding multiple listeners
sub.subscribe("MESSAGES");

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

// Listener to server
const PORT = process.env.PORT || 5000;
const createdServer = app.listen(
  PORT,
  console.log(`Server is up and running on ${PORT}`)
);

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from this origin
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Allow all methods
};

const ioInstance = io(createdServer, {
  pingTimeout: 60000,
  cors: corsOptions, // Set CORS options for Socket.IO server
});

ioInstance.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("setup", (userData) => {
    console.log("[+] User data received:", userData);
    socket.join(userData.id);
    socket.emit("connected"); // Emit connected to acknowledge setup completion
  });

  socket.on("join room", (chatId) => {
    console.log("[+] Chat ID received for joining room:", chatId);
    socket.join(chatId);
  });

  socket.on("new message", async (msg, { reciverId, senderId }, ACCESSTOKEN) => {
    console.log("[+] ACCESSTOKEN", ACCESSTOKEN);
    console.log("[+] newMessageReceive:", msg);
    console.log("[+] Receiver ID:", reciverId, ", Sender ID:", senderId);
    if (reciverId && senderId && ACCESSTOKEN) {
      console.log(`Emitting message to receiver: ${reciverId}`);
      console.info(`\n\n[+] File:-- server.js, Line:-- 93, publishing message to the redis`);
      msg.reciverId = reciverId;
      msg.senderId = senderId;
      msg.token = ACCESSTOKEN;
      try {
        await pub.publish("MESSAGES", JSON.stringify(msg));
      } catch (error) {
        console.log('\n\n[+]: error', error);
      }
    } else {
      console.log("Invalid receiver or sender ID.");
    }
  });

  socket.on("disconnect", () => {
    console.log("[+] A user disconnected");
  });
});

// Listen for messages from Redis on a global level (outside the socket connection event)
sub.on("message", async (channel, message) => {
  console.log('\n\n[+]: message', message);
  console.log('\n\n[+]: channel', channel);
  if (channel === "MESSAGES") {
    try {
      const msg = JSON.parse(message);
      console.log("[+] Received message on channel 'MESSAGES':", msg);

      const { reciverId, token } = msg; // Ensure reciverId is part of the published message
      console.log('\n\n[+]: reciverId', msg.reciverId);
      if (reciverId && token) {
        console.log(`Emitting message to receiver: ${reciverId}`);
        ioInstance.to(reciverId).emit("message received", msg);

        // Send message to the API
        const msgBody = {
          content: msg.content,
          chatId: msg.chat,
        };
        console.log('\n\n[+]: msgBody', msgBody);

        console.info("[+] Sending message to API...");
        await apiWrapper(
          "http://localhost:5000/api/v1/messages",
          "POST",
          { Authorization: `Bearer ${msg.token}` }, // Include token from the published message
          {}, // Query parameters
          msgBody, // Body params
          true // Condition to include custom headers
        );
      } else {
        console.error("Receiver ID or token is missing.");
      }
    } catch (error) {
      console.error("Error processing message from Redis:", error.message);
    }
  }
});
