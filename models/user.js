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
  const collection = await db.collection('users');
  const passwordHash = await bcrypt.hash(userToInsert.password, 8);
  userToInsert.password = passwordHash;
  const result = await collection.insertOne(userToInsert).insertedId;
  return result;
}


/*
 * Authenticate a User against the DB.
 someone else can work on this
 */
exports.authenticateUser = async (user) => {
  console.log(" == authenticateUser: user", user);

  return true;
}


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

  // becasue the varialbe name and the object name are the same,
  //we can just leave it as { email, } thnx es6

   var user;
   user = await db.collection('users').findOne({email})
   console.log(" == getUserDetailsByEmail email", email,"\nUser: ",user);
   delete user.password;
  return user;
}
