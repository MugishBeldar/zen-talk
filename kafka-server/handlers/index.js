const { Kafka } = require("kafkajs");
const {ObjectId} = require('mongodb')

const kafka = new Kafka({
  clientId: "zen-talk",
  brokers: ["localhost:9092"],
});

const createMessageStreamConsumer = require("./message-stream-consumer");
const messageStreamConsumer = createMessageStreamConsumer({ kafka, ObjectId });

module.exports = {
  messageStreamConsumer
};
