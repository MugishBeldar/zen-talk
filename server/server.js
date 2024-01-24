const app = require('./app');
const config = require('./config');
const port = global.isNewHopeInstance ? 4040 : config.server.port;

const server = require('http').Server(app);

try {
    server.listen(port, config.server.host, function () {
        console.log('------------- App running on port', port);
    });
} catch (error) {
    console.error('Error starting the server:', error);
}
