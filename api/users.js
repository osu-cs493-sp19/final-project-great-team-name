/* @users.js
 *
 * Routes for /users
 *
 */

const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const CustomError = require("../lib/custom-error");

const {
   UserSchema,
   AuthSchema,
   insertNewUser,
   authenticateUser,
   getUserDetailsById,
   getUserDetailsByEmail
} = require('../models/user');


/*
 * Fetches information about a user based on their role
 * requireAuthentication - check for valid token
 *
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {

  try {


    const user = await getUserDetailsById(req.params.id);
    res.status(201).send({});

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("User not found.", 404));
  }
});


/*
 * Create a new user
 * requiresAuthentication - check for valid token
 *
 */
 router.post('/', async (req, res, next) => {
   if (validateAgainstSchema(req.body, UserSchema)) {
     try {

        const id = await insertNewUser(req.body);
        res.status(201).send({id: id})

     } catch (err) {
       // Throw a 500 for all errors incuding DB issues
       next(new CustomError("Error adding user.", 500));
     }

   } else {
     next(new CustomError("Request is not Valid", 400));
   }
 });


/*
 * Route to authenticate a user.
 */
router.post('/login', async (req, res, next) => {

  if (validateAgainstSchema(req.body, AuthSchema)) {
    try {
      const auth = await authenticateUser(req.body);

      if (auth) {
        // Fetch additional data about user to include in token
        //const user = getUserDetailsByEmail(req.body.email);

        // Static data for testing
        var user = {};      
        user.id = "17";
        user.email = "user@example.com";
        user.role = 'admin';
        user.name = "Admin User";

        const token = generateAuthToken(user);

        res.status(200).send({ token: token });
      } else {
        next(new CustomError("Authentication failed.", 401));
      }
    } catch (err) {
      console.error(err);
       next(new CustomError("Authentication error.  Please try again later.", 500));
    }
  } else {
    next(new CustomError("Login requires email and password.", 400));
  }
});

module.exports = router;