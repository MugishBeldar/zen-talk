const express = require('express');
const cors = require('cors');
const config = require('./config');
const Module = require('./modules');

const app = express();
global.express = express;
global.CONFIG = config;
global.ROOT_PATH = __dirname;


app.use(cors());
app.use(express.json());

async function init() {
    try {
        const Mongo = require('./helper/mongo');
        global.mongoConnect = new Mongo();
        await global.mongoConnect.connectMaster(); // Assuming connectMaster returns a Promise
    } catch (error) {
        console.error('Error in mongoconnection', error);
    }

    app.use((req, res, next) => {
        // for fcp tenant connection
        global.mongoConnect.validateDivision.bind(global.mongoConnect)(req, res, next);
    });

    const appModule = new Module(app, config);
    appModule.init();
}

init();

module.exports = app;
