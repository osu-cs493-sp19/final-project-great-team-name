

const MongoClient = require('mongodb').MongoClient;
var { ObjectId,GridFSBucket }= require('mongodb');
const _ID = ObjectId;
exports['_ID'] = _ID;
exports.grid_bucket = GridFSBucket;

var mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoReplSetName = process.env.MONGO_REPL_SET_NAME;

if(process.env.NODE_ENV==="development"){
  mongoHost = "localhost"
}

const mongoReplSetOption = mongoReplSetName ? `?replicaSet=${mongoReplSetName}` : "";
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}${mongoReplSetOption}`;

var db = null;
exports.connectToMongo = function (callback) {
  MongoClient.connect(mongoURL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      throw err;
    }
    db = client.db(mongoDBName);
    console.log("===we have connect to Mongo");
    callback();
  });
};

exports.getDBReference = function () {
  return db;
};
