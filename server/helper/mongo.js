const mongoose = require("mongoose");
const fs = require("fs");

class MongoConnect {
  constructor() {
    this.mongoConnections = {};
  }

  static connectServer({
    username,
    password,
    host,
    isGlobal,
    database,
    retryWrites,
  }) {
    try {
      let mongoClient;
      // TODO UNCOMMENT
      // let uri = 'mongodb+srv://';
      let uri = "";

      if (username !== "" && password !== "") {
        uri += `${username}:${password}@`;
      }

      uri += `${host}/${database}`;

      if (retryWrites) {
        uri += `?retryWrites=${retryWrites}&w=majority`;
      }
      const options = {
        // useNewUrlParser: true,
        // useUnifiedTopology: true, // Add this option for the latest versions of Mongoose
        autoIndex: true,
        maxPoolSize: 10,
        connectTimeoutMS: 100000,
        socketTimeoutMS: 100000,
        serverSelectionTimeoutMS: 100000,
      };

      if (isGlobal) {
          mongoose.connect(uri, options).then(
              () => {
                  console.info(`Worker ${process.pid} connected to Mongo Database`);
                },
                (err) => {
                    console.error(
              `Worker ${process.pid} failed connecting to Mongo Database: ${err}`
              );
            }
            );
            mongoClient = mongoose;
        } else {
        mongoClient = mongoose.createConnection(uri, options);
        mongoClient.on("connected", () => {
          console.info(
            `Worker ${global.process.pid} connected to Mongo Database ${database}`
          );
        });

        mongoClient.on("disconnected", () => {
          console.info(
            `Worker ${global.process.pid} disconnected to Mongo Database ${database}`
          );
        });
      }

      if (!global.Mongoose) {
        global.Mongoose = mongoose;
      }
      return mongoClient;
    } catch (e) {
      console.log("---------MongoConnectionError--------", e);
    }
  }

  connectMaster() {
    try {
      const mongoConfig = global.CONFIG["mongo"];
      const username = mongoConfig["username"];
      const password = mongoConfig["password"];
      const host = mongoConfig["host"][0].host;
      const database = mongoConfig["db_name"];
      const debug = mongoConfig["debug"] || false;
      const retryWrites = mongoConfig["retryWrites"] || false;
      MongoConnect.connectServer({
        username,
        password,
        host,
        database,
        debug,
        isGlobal: false,
        retryWrites,
      });
    } catch (e) {
      console.log("-----------MasterMongoError--------", e);
    }
  }

  __getDBConnection(database) {
    if (this.mongoConnections[database]) {
      return this.mongoConnections[database];
    }
    const mongoConfig = global.CONFIG["mongo"];
    const username = mongoConfig["username"];
    const password = mongoConfig["password"];
    const host = mongoConfig["host"][0].host;
    const replicaSet = mongoConfig["replicaSet"] || false;
    const client = MongoConnect.connectServer({
      username,
      password,
      host,
      database,
      replicaSet: replicaSet,
    });
    this.__loadCollections(client);
    this.mongoConnections[database] = client;
    return client;
  }

  __loadCollections(client) {
    fs.readdirSync(`${global.ROOT_PATH}/modules`)
      .filter((moduleDirectory) => {
        const foundFileObj = fs.statSync(
          `${global.ROOT_PATH}/modules/${moduleDirectory}`
        );
        return moduleDirectory.indexOf(".") !== 0 && foundFileObj.isDirectory();
      })
      .forEach((moduleDirectory) => {
        fs.readdirSync(`${global.ROOT_PATH}/modules/${moduleDirectory}`)
          .filter((foundFileObj) => {
            return (
              foundFileObj.indexOf(".") !== 0 &&
              foundFileObj.endsWith(".model.js")
            );
          })
          .forEach((file) => {
            const Model = require(`${global.ROOT_PATH}/modules/${moduleDirectory}/${file}`);
            new Model(client);
          });
      });
  }

  async validateDivision(req, res, next) {
    try {
      req.App = {
        activeDB: this.__getDBConnection("chat_application"),
      };
      next();
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = MongoConnect;
