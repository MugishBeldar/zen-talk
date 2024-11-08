global.CONFIG = require("./config/development.json");
require("dotenv").config();
require("./config/dbConnect");
const cors = require("cors");
const logger = require("morgan");
const express = require("express");
const { Kafka } = require("kafkajs");
const messageRouter = require("./routes/messages/message-route");
const { sendError, sendResponse } = require("../server/util/api-handler");


const app = express();

// Kafka consumers
const {messageStreamConsumer} = require('./handlers');
const { protect } = require("./middleware/jwtAuth");
messageStreamConsumer()

// Middlewares
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads
app.use(logger("dev"));
app.use(protect)

//---------
// Routes
//---------


// Health Check
app.use("/health", (_req, res) => {
  sendResponse(res, 200, { message: "OK" });
});


// Test function for kafka test route
async function kafkaLable( id ) {
  const kafka = new Kafka({
    clientId: 'zen-talk',
    brokers: ['localhost:9092'],
  })

  const producer = kafka.producer();

  // async function run() {
    await producer.connect()
    await producer.send({
      topic: 'add-chat-lable',
      messages: [
        { value: id },
      ],
    })
    producer.disconnect();
}


// Kafka Test Route
app.use("/kafka-test", async (_req, res) => {
  sendResponse(res, 200, { message: "Kafka test message sent." });
  kafkaLable('10')
});


// Message route
app.use("/api/v1/messages/", messageRouter);


// 404 Route for unmatched paths
app.use("*", (_req, res) => {
  sendError(res, 400, "Route not found");
});

// Start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, async () => {
  console.log(`[+] Kafka server started on ${PORT}`);
});
