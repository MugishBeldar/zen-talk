const moment = require("moment-timezone");

class MessageModel {
  constructor(tenantDB) {
    const Schema = global.Mongoose.Schema;
    const MessageSchema = new Schema({
      sender: { type: global.Mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String, trim: true },
      readby: [{ type: global.Mongoose.Schema.Types.ObjectId, ref: "User" }],
      chat: { type: global.Mongoose.Schema.Types.ObjectId, ref: "Chat" },
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
    tenantDB["Message"] = tenantDB.model("Message", MessageSchema);
  }
}
module.exports = MessageModel;
