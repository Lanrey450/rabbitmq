const mongoose = require('mongoose');
const debug = require('debug')('mongodb');
const config = require('./config');


const defaultConfig = {
    username: config.databases.mongodb.user,
    password: config.databases.mongodb.password,
    host: config.databases.mongodb.host,
    port: config.databases.mongodb.port,
    db: config.databases.mongodb.db,
    url: config.databases.mongodb.url
};

console.log(defaultConfig.url, "default-config");

// switch when deploying for production envs

const defaultUrl = defaultConfig.url || `mongodb://${defaultConfig.username}:${defaultConfig.password}@${defaultConfig.host}:${defaultConfig.port}/${defaultConfig.db}?retryWrites=true`;

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
    console.log(error.message, new Error(error.message), { defaultUrl }, true);
    process.exit(0);
});

global.db = db;
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});
