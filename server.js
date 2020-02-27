require('dotenv').config();
const errorHandler = require('./lib/request_error_handler');
const responseManager = require('./lib/response_manager_middleware');


const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(responseManager);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Aggregator subscription and billing Engine')
});

require('./routes')(app);

// require all the routes here
require('./lib/9mobileApi/notifications')(app);

// must be the last middleware
app.use(errorHandler);


app.listen(config.port, () => {
    console.log(`${config.name} listening on port ${config.port}!`);
});

module.exports = app;
