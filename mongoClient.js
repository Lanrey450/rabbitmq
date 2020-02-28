const mongoose = require('mongoose');
const debug = require('debug')('mongodb');
const config = require('./config');

const defaultConfig = {
    username: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    db: config.db,
};

const defaultUrl = `mongodb://${defaultConfig.username}:${defaultConfig.password}@${defaultConfig.host}:${defaultConfig.port}/${defaultConfig.db}` || 'mongodb://localhost:27017/subscription&billing';

mongoose.set('debug', true);


console.log("MONGO_DB_FULL_URL", defaultUrl);
mongoose.connect(defaultUrl, {useNewUrlParser: true, useCreateIndex: true}).catch(err => console.log(err));
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("connected", () => {
    console.log("mongodb connected");
});
db.on('error', (error) => {
    console.error("An error occurred", JSON.stringify(error));
    logger(error.message, new Error(error.message), { mongodbUrl }, true);
    process.exit(0);
});

global.db = db;
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});
