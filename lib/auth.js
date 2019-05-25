/*
 * Authuthentication functions
 */

const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret!';

exports.generateAuthToken = function (user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
  return token;
};

exports.requireAuthentication = async function (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

  try {
    // Ensure that a token was provided
    if (!token) {
      throw CustomError("No token provided.", 401);
    }

    const payload = jwt.verify(token, secretKey);

    // Dump token data back into req for further checking
    req.user = payload;

    next();
  } catch (err) {

    // Allow POST /users with or without a token to support
    // admin registration
    if (req.method == "POST" && req.baseUrl == "/users") {
      next();
    } else {
      next(new CustomError("Invalid authentication token", 401))
    }


  }
};
