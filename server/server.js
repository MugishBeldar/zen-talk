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

  socket.on("setup", (userData) => {
    console.log("[+] User data received:", userData);
    socket.join(userData.id);
    socket.emit("connected"); // Emit connected to acknowledge setup completion
  });

  socket.on("join room", (chatId) => {
    console.log("[+] Chat ID received for joining room:", chatId);
    socket.join(chatId);
  });

  // socket.on("new message", (newMessageReceive) => {
  //   console.log("[+] newMessageReceive:", newMessageReceive);
  //   const chatUsers = newMessageReceive.users;

  //   if (!chatUsers) {
  //     console.log("chat or chat.users is not defined");
  //     return;
  //   }

  //   chatUsers.forEach((user) => {
  //     if (user._id === newMessageReceive.sender._id) return;
  //     console.log(`Emitting to user: ${user._id}`);
  //     socket.to(user._id).emit("message received", newMessageReceive);
  //   });
  // });

  socket.on("new message", (msg, { reciverId, senderId }, ACCESSTOKEN) => {
    console.log("[+] ACCESSTOKEN", ACCESSTOKEN);
    console.log("[+] newMessageReceive:", msg);
    console.log("[+] Receiver ID:", reciverId, ", Sender ID:", senderId);

    // Emit the message to the receiver (except the sender)
    if (reciverId && senderId && ACCESSTOKEN) {
      console.log(`Emitting message to receiver: ${reciverId}`);
      socket.to(reciverId).emit("message received", msg);
      (async () => {
        const msgBody = {
          content: msg.content,
          chatId: msg.chat,
        };
        try {
          apiWrapper(
            "http://localhost:7000/api/v1/messages",
            "POST",
            { Authorization: `Bearer ${ACCESSTOKEN}` }, // Custom headers
            {}, // Query parameters
            msgBody, // Body params (empty for GET)
            true // Condition to include custom headers
          );
        } catch (error) {
          console.error("Error:", error.message);
        }
      })();
    } else {
      console.log("Invalid receiver or sender ID.");
    }
  });

  socket.on("disconnect", () => {
    console.log("[+] A user disconnected");
  });
});
