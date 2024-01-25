const auth = require('./auth');
const jwtAuth = require('../app-auth');
class UsersController {
    constructor(app) {
        const router = global.express.Router();

        // system user login
        router.post('/login', auth.userAuthenticate.bind(auth));
        router.post('/signup', auth.registerUser.bind(auth));
        router.get('/', auth.getUsers.bind(auth));

        // Add this line to use the router in your app
        app.use('/api/v1/users', jwtAuth.protect.bind(jwtAuth), router);
    }
}

module.exports = UsersController;
