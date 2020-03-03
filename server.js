require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TerraLogger = require('terra-logger');


const app = express();

const routes = require('./routes/index');


const config = require('./config');
const responseManager = require('./commons/response');

require('./mongoClient');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


app.use(responseManager);

app.use(TerraLogger.requestHandler);

// parse application/json
app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Aggregator subscription and billing Engine')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
var err = new Error('Not Found');
err.status = 404;
next(err);
});

// add routes here 
app.use(routes);

app.listen(config.port, () => {
    console.log(`${config.name} listening on port ${config.port}!`);
});

module.exports = app;
