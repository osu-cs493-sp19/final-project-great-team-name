require('dotenv').config()

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const CustomError = require("./lib/custom-error");
const {connectToMongo} = require("./lib/mongoDB");
const logger = require('./lib/logger');
const api = require('./api');

const { rateLimit } = require('./lib/redis');

const app = express();
const port = process.env.PORT || 8000;


/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());

app.use(logger);

//Rate Limit
app.use(rateLimit);


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

/*
 * Default error handling route
 */
app.use('*', (err, req, res, next) => {
  console.error(" == Caught CustomError: ", err.code, err.message);
  res.status(err.code).send({
    error: err.message
  });
});

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

connectToMongo(()=>{
  app.listen(port, function() {
  console.log("== Server is running on port", port);
});
})
