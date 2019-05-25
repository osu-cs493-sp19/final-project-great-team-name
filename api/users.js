/* @users.js
 *
 * Routes for /users
 *
 */

const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
//
const {
   UserSchema,
   AuthSchema,
   insertNewUser,
   authenticateUser,
   getUserDetailsById
} = require('../models/user');

/*
 * Fetches information about a user based on their role
 * requireAuthentication - check for valid token
 *
 */
 router.get('/', requireAuthentication, async (req, res) => {
   if (validateAgainstSchema(req.body, UserSchema)) {
     try {

        res.status(201).send({});

     } catch (err) {
       // Expects CustomError Object
       next(err);
     }

   } else {
     next(new CustomError("Request is not Valid", 400));
   }
 });

/*
 * Create a new user
 * requiresAuthentication - check for valid token
 *
 */
 router.post('/', async (req, res) => {
   if (validateAgainstSchema(req.body, UserSchema)) {
     try {

        const id = await insertNewUser(req.body);
        res.status(201).send({id: id})

     } catch (err) {
       // Expects CustomError Object
       next(err);
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
        // Fetch additional data about user
        const user = getUserDetailsbyId(req.body.id);
        const token = generateAuthToken(user);

        res.status(200).send({ token: token });
      } else {
        next(new CustomError("Authentication failed.", 401));
      }
    } catch (err) {
      console.error(err);
       next(new CustomError("Authentication error.  Please try again later.", 500);
    }
  } else {
    next(new CustomError("Login requires email and password.", 400);
  }

});

module.exports = router;
