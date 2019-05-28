/* @user.js
 *
 * User model and related functions.
 *
 */
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getDBReference } = require("../lib/mongoDB")
const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");


/*
* Schema describing required/optional fields of a User object.
*/
const UserSchema = {
 name: { required: true },
 email: { required: true },
 password: { required: true },
 role: { required: true }
};
exports.UserSchema = UserSchema;


/*
* Schema describing required fields for User object for authorization.
*/
const AuthSchema = {
 email: { required: true },
 password: { required: true }
};
exports.AuthSchema = AuthSchema;


/*
 * Insert a new User into the database
 */
exports.insertNewUser = async (user) => {
  console.log(" == insertNewUser: user", user);
  const userToInsert = extractValidFields(user, UserSchema);
  const db = getDBReference();
  const collection = db.collection('users');
  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;
  const result = await collection.insertOne(userToInsert);
  return SpeechRecognitionResultList.insertedId;
}

//
// /*
//  * Authenticate a User against the DB.
//  */
// exports.authenticateUser = async (user) => {
//   console.log(" == authenticateUser: user", user);
//
//   return true;
// }


/*
 * Fetch details about a User by Id
 */
exports.getUserDetailsById = async (id) => {
  console.log(" == getUserDetailsById id", id);

  return "123";
}


/*
 * Fetch details about a User by Email address
 */
exports.getUserDetailsByEmail = async (email) => {
  const db = getDBReference();
   var user = await db.collection("users").find({
    email,
  });

  console.log(" == getUserDetailsByEmail email", email,"\nUser: ",user);
  return user;
}
