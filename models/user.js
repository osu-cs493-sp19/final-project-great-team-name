/* @user.js
 *
 * User model and related functions.
 *
 */

const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");


/*
* Schema describing required/optional fields of a user object.
*/
const UserSchema = {
 name: { required: true },
 email: { required: true },
 password: { required: true },
 role: { required: true }
};
exports.UserSchema = UserSchema;


/*
* Schema describing required fields for authorization.
*/
const AuthSchema = {
 email: { required: true },
 password: { required: true }
};
exports.AuthSchema = AuthSchema;


/*
 * Insert a new user into the database
 */
exports.insertNewUser = async (user) => {
  console.log(" == insertNewUser: user", user);

  return "123";
}


/*
 * Authenticate a user against the DB.
 */
exports.authenticateUser = async (user) => {
  console.log(" == authenticateUser: user", user);

  return true;
}


/*
 * Fetch details about a user by Id
 */
exports.getUserDetailsById = async (id) => {
  console.log(" == getUserDetailsById id", id);

  return "123";
}


/*
 * Fetch details about a user by Email address
 */
exports.getUserDetailsByEmail = async (email) => {
  console.log(" == getUserDetailsByEmail email", email);

  return "1234";
}