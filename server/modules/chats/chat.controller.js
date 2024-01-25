const chat = require('./chat');
const jwtAuth = require('../app-auth');
class ChatController {
    constructor(app) {
        const router = global.express.Router();

        router.post('/', chat.accessChat.bind(chat));
        router.get('/', chat.fetchChats.bind(chat));   
        router.post('/group', chat.createGroupChat.bind(chat)); 
        router.put('/renamegroup', chat.renameGroup.bind(chat));   
        // router.get('/groupremove', chat.removeGroup.bind(chat));   
        // router.get('/groupadd', chat.addToGroup.bind(chat));   

        // Add this line to use the router in your app
        app.use('/api/v1/chat', jwtAuth.protect.bind(jwtAuth), router);
    }
}

module.exports = ChatController;
