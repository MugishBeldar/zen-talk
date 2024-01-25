class MessageModel {
  constructor(tenantDB) {
    const Schema = global.Mongoose.Schema;
    const MessageSchema = new Schema({
      sender: { type: global.Mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, trim: true },
      readby: [{ type: global.Mongoose.Schema.Types.ObjectId, ref: "User" }],
      chat: { type: global.Mongoose.Schema.Types.ObjectId, ref: "Chat" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });
    tenantDB["Message"] = tenantDB.model("Message", MessageSchema);
  }
}
module.exports = MessageModel;
