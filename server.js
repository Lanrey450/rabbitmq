require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TerraLogger = require('terra-logger');
const app = express();


const config = require('./config');
const responseManager = require('./lib/response_manager_middleware');
const routes = require('./routes/index');

require('./mongoClient');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(TerraLogger.requestHandler);

// parse application/json
app.use(bodyParser.json());

app.use(responseManager);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Aggregator subscription and billing Engine')
});


// add routes here 
require(routes)(app);

app.listen(config.port, () => {
    console.log(`${config.name} listening on port ${config.port}!`);
});

module.exports = app;
