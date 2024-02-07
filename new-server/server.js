require("dotenv").config();
require("./config/dbConnet");
const express = require("express");
const userRouter = require("./routes/Users/userRoutes");
const chatRouter = require("./routes/Chats/chatRoutes");
const { protect } = require("./middleware/jwtAuth");

const app = express();

// Middlewares
app.use(express.json()); // Pass incoming payload
app.use(protect);

//---------
// Routes
//---------

// User route
app.use("/api/v1/users/", userRouter);

// Chat route
app.use('/api/v1/chats/', chatRouter)

// Message route
// app.use('/api/v1/messages/', )

//Lister to server

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server is up adn runing on ${PORT}`));
