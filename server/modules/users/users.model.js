const moment = require('moment-timezone');
class UserModel {
  constructor(tenantDB) {
    const Schema = global.Mongoose.Schema;
    const UserSchema = new Schema({
        name: {type: String},
        email: { type: String },
        password: { type: String },
        profilePic: { type: String },
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
    tenantDB['User'] = tenantDB.model('User', UserSchema);
  }
}
module.exports = UserModel;

