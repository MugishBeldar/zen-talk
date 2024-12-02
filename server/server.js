require("dotenv").config();
require("./config/dbConnet");
const config = require('./config/development.json');
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
const testRouter = require("./routes/Test/testRoutes");

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

// Endpoint for vercel
app.get("/", (req, res) => {
  res.send("Hello from Vercel!");
});

// Refreshtoken route
app.use("/api/v1/token/", refreshTokenRouter);

// User route
app.use("/api/v1/users/", userRouter);

// Chat route
app.use("/api/v1/chats/", chatRouter);

// Message route
app.use("/api/v1/messages/", messageRouter);

app.use('/api/v1/test/', testRouter);

// Listener to server
const PORT = process.env.PORT || 5000;
const createdServer = app.listen(
  PORT,
  console.log(`Server is up and running on ${PORT}`)
);

// origin: "https://zen-talk.vercel.app",
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

const onlineUsers = new Map();

const ioInstance = io(createdServer, {
  transports: ["polling"], // Use polling transport
  pingTimeout: 60000,
  cors: corsOptions, // Set CORS options for Socket.IO server
  polling: {
    interval: 5000, // Set the polling interval to 5 seconds
  },
});

ioInstance.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // use this setup for showing online users.
  socket.on("setup", (userData) => {
    console.log("[+] User data received:", userData);
    console.log(`[+] User ${userData.id} is online with socket ID ${socket.id}`);
    socket.join(userData.id);
    onlineUsers.set(userData.id, socket.id); // Store user ID and socket ID
    ioInstance.emit("onlineUsers", Array.from(onlineUsers.keys()));
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

  socket.on("new chat user", async (chatCreater, chatUser) => {
    console.log('\n\n[+]: chatCreater', chatCreater);
    console.log('\n\n[+]: chatUser', chatUser);

    // Emit the event to all connected clients (or a specific room)
    ioInstance.emit("get new chat user", chatCreater, chatUser);
  });

  socket.on("disconnect", () => {
    console.log("[+] A user disconnected");
  });
});

// Listen for messages from Redis on a global level (outside the socket connection event)
sub.on("message", async (channel, message) => {
  if (channel === "MESSAGES") {
    try {
      const msg = JSON.parse(message);
      const { reciverId, token } = msg; // Ensure reciverId is part of the published message
      if (reciverId && token) {
        ioInstance.to(reciverId).emit("message received", msg);

        const msgBody = {
          content: msg.content,
          chatId: msg.chat,
        };
        console.log('\n\n[+]: msgBody', msgBody);

        console.info("[+] Sending message to API...");
        // "http://localhost:5000/api/v1/messages",
        apiWrapper(
          `${"http://localhost:5000"}/api/v1/messages`,
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
