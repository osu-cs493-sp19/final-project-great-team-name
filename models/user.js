
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

  return "123";
}

/*
 * Authenticate a user against the DB.
 */
exports.authenticateUser = async (user) => {

  return true;
}


/*
 * Fetch details about a user by Email address
 */
exports.getUserDetailsById = async (id) => {

  return {email: "user@example.com"};
}
