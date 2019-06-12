// Module for the mongo connection

const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoReplSetName = process.env.MONGO_REPL_SET_NAME;

const mongoReplSetOption = mongoReplSetName ? `?replicaSet=${mongoReplSetName}` : "";
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}${mongoReplSetOption}`;

let db = null;

exports.connectToDB = function (callback) {
    MongoClient.connect(mongoUrl, (err, client) => {
        db = client.db(mongoDBName);
        callback();
    });
};

exports.getDBReference = function() {
    return db;
};
