
class UserModel {
  constructor(tenantDB) {
    const Schema = global.Mongoose.Schema;
    const UserSchema = new Schema({
        name: {type: String},
        email: { type: String },
        password: { type: String },
        profilePic: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    });
    tenantDB['User'] = tenantDB.model('User', UserSchema);
  }
}
module.exports = UserModel;

