require('dotenv').config();
const responseManager = require('./lib/response_manager_middleware');


const routes = require('./routes/index');


console.log(routes);


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


// add routes here 
app.use(require('./routes'));



app.listen(config.port, () => {
    console.log(`${config.name} listening on port ${config.port}!`);
});

module.exports = app;
