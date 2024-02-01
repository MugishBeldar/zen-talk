// const auth = require('./auth');
const message = require('./message');
const jwtAuth = require("../app-auth");
class MessageController {
  constructor(app) {
    const router = global.express.Router();

    router.post("/", message.createMessage.bind(message));
    router.get('/:chatId',message.allMessages.bind(message))
    // Add this line to use the router in your app
    app.use("/api/v1/message", jwtAuth.protect.bind(jwtAuth), router);
  }
}

module.exports = MessageController;
