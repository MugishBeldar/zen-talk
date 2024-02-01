const moment = require("moment-timezone");
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
      createdAt: {
        type: String,
        default: moment
          .tz("Asia/Calcutta")
          .format("dddd DD-MM-YYYY hh:mm:ss A "),
      },
      updatedAt: {
        type: String,
        default: moment
          .tz("Asia/Calcutta")
          .format("dddd DD-MM-YYYY hh:mm:ss A "),
      },
    });
    tenantDB["Chat"] = tenantDB.model("Chat", ChatSchema);
  }
}
module.exports = ChatModel;
