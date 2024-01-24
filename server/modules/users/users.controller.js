const auth = require('./auth');

class UsersController {
    constructor(app) {
        const router = global.express.Router();

        // system user login
        router.post('/login', auth.userAuthenticate.bind(auth));
        router.post('/signup', auth.registerUser.bind(auth));

        // Add this line to use the router in your app
        app.use('/api/v1/users', router);
    }
}

module.exports = UsersController;
