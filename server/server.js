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
  // Allow all origins
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

const onlineUsers = new Map();

const ioInstance = io(createdServer, {
  transports: ["polling"],
  pingTimeout: 60000,
  cors: corsOptions,
  polling: {
    interval: 5000,
  },
});

ioInstance.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  //################################# Initial socket setup #########################################
  // use this setup for showing online users.
  socket.on("setup", (userData) => {
    console.log(`[+] User ${userData.id} is online with socket ID ${socket.id}`);
    socket.join(userData.id);
    // Store user ID and socket ID
    onlineUsers.set(userData.id, socket.id);
    ioInstance.emit("onlineUsers", Array.from(onlineUsers.keys()));
    // Emit connected to acknowledge setup completion
    socket.emit("connected");
  });

  socket.on("join room", (chatId) => {
    console.log("[+] Chat ID received for joining room:", chatId);
    socket.join(chatId);
  });

  //################################## Socket events for messaging ###############################
  socket.on("new message", async (msg, { reciverId, senderId }, ACCESSTOKEN) => {
    if (reciverId && senderId && ACCESSTOKEN) {
      console.log(`Emitting message to receiver: ${reciverId}`);
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
    // Emit the event to all connected clients (or a specific room)
    ioInstance.emit("get new chat user", chatCreater, chatUser);
  });

  //########################## Socket events for typing ###############################
  // When user start typing
  socket.on('typing', (senderUser, reciverUser) => {
    ioInstance.emit('userTyping', senderUser, reciverUser);
  })

  // When user stop typing
  socket.on('stopTyping', (senderUser, reciverUser) => {
    ioInstance.emit('stopUserTyping', senderUser, reciverUser);
  })

  //############################# Socket events for audio calling ######################
  // Handle call offer
  socket.on("call-offer", ({ offer, to }) => {
    console.log('\n\n[+]: to', to);
    console.log('\n\n[+]: offer', offer);
    console.log('online users:---', onlineUsers);
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("call-offer", { offer, from: socket.id });
    } else {
      console.error(`User ${to} not found.`);
    }
  });

  // Handle call answer
  socket.on("call-answer", ({ answer, to }) => {
    socket.to(to).emit("call-answer", { answer });
  });

  // Handle ICE candidates
  socket.on("ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", (to) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("end-call");
    }
  });

  // Handle outgoing call
  socket.on("outGoingCall", (receiverId) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("outGoingCall", { from: socket.id });
      console.log(`Outgoing call from ${socket.id} to ${receiverId}`);
    } else {
      console.log(`Receiver ${receiverId} not found`);
    }
  });

  // Handle call acceptance
  socket.on("outGoingCallAccepted", ({ to }) => {
    socket.to(to).emit("outGoingCallAccepted", { from: socket.id });
    console.log(`Call accepted by ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`[+] User ${userId} disconnected.`);
        break;
      }
    }
    ioInstance.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// Listen for messages from Redis on a global level (outside the socket connection event)
sub.on("message", async (channel, message) => {
  if (channel === "MESSAGES") {
    try {
      const msg = JSON.parse(message);
      // Ensure reciverId is part of the published message
      const { reciverId, token } = msg;
      if (reciverId && token) {
        ioInstance.to(reciverId).emit("message received", msg);

        const msgBody = {
          content: msg.content,
          chatId: msg.chat,
        };
        // "http://localhost:5000/api/v1/messages",
        apiWrapper(
          `${"http://localhost:5000"}/api/v1/messages`,
          "POST",
          // Include token from the published message
          { Authorization: `Bearer ${msg.token}` },
          // Query parameters
          {},
          // Body params
          msgBody,
          // Condition to include custom headers
          true
        );
      } else {
        console.error("Receiver ID or token is missing.");
      }
    } catch (error) {
      console.error("Error processing message from Redis:", error.message);
    }
  }
});
