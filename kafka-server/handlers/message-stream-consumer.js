module.exports = function createMessageStreamConsumer({ kafka, ObjectId }) {
  return function messageStreamConsumer() {
    const consumer = kafka.consumer({ groupId: "chat-group" });
    consumer.connect();
    consumer.subscribe({ topic: "add-chat-lable", fromBeginning: false });

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse the incoming message
          const newMessage = JSON.parse(message.value.toString());

          // Use insertOne to create the message
          const insertedMsg = await global.dbConnection
            .collection("messages")
            .insertOne({
              sender: new ObjectId(newMessage.sender),
              content: newMessage.content,
              chat: new ObjectId(newMessage.chat),
              createdAt: Date.now(), 
              updatedAt: Date.now(),
            });

          // Retrieve the newly created message
          let newLyInsertedMessage = await global.dbConnection
            .collection("messages")
            .findOne({ _id: insertedMsg.insertedId });

          // Update the 'chats' collection with the latest message reference
          await global.dbConnection
            .collection("chats")
            .updateOne(
              { _id: new ObjectId(newMessage.chat) },
              { $set: { latestMessage: newLyInsertedMessage._id } }
            );
        } catch (error) {
          console.error("[-] Error processing message: ", error);
          // Additional error handling (e.g., logging, retry logic) can be added here.
        }
      },
    });
  };
};
