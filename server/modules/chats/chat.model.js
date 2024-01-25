class ChatModel {
  constructor(tenantDB) {
    const Schema = global.Mongoose.Schema;
    const ChatSchema = new Schema({
      chatName: { type: String, trim: true },
      isGroupChat: { type: Boolean, default: false },
      users: [{ type: global.Mongoose.Schema.Types.ObjectId, ref: "User" }],
      latestMessage: {
        type: global.Mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      groupAdmin: { type: global.Mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });
    tenantDB["Chat"] = tenantDB.model("Chat", ChatSchema);
  }
}
module.exports = ChatModel;
