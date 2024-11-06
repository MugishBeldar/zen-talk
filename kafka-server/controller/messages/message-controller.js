const moment = require("moment-timezone");
const { sendResponse, sendError } = require("../../util/api-handler");
const { Kafka } = require("kafkajs");

const createMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return sendError(res, 400, "content and chatId is required");
    }

    sendResponse(res, 201);
    sendMessageToKafkaStream(req, chatId, content);
    return;
  } catch (error) {
    return sendError(res, 500, "Internal Server Error", error);
  }
};

const sendMessageToKafkaStream = async (req, chatId, content) => {
  const kafka = new Kafka({
    clientId: "zen-talk",
    brokers: ["localhost:9092"],
  });

  const producer = kafka.producer();
  await producer.connect();
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  await producer.send({
    topic: "add-chat-lable",
    messages: [
      {
        value: JSON.stringify(newMessage),
      },
    ],
  });
  producer.disconnect();
};
module.exports = Object.freeze({
  createMessage,
});
