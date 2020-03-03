require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TerraLogger = require('terra-logger');


const routes = require('./routes');
const app = express();


const config = require('./config');

require('./mongoClient');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


app.use(TerraLogger.requestHandler);

// parse application/json
app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Aggregator subscription and billing Engine')
});

// add routes here 
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.listen(config.port, () => {
    console.log(`${config.name} listening on port ${config.port}!`);
});

module.exports = app;
