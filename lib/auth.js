/*
 * Authuthentication functions
 */

 const { instructorOwnsCourse, studentInCourse } = require('../models/course');
 const CustomError = require("../lib/custom-error");


const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret!';

exports.generateAuthToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
  return token;
};

exports.requireAuthentication = async (req, res, next) => {
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
    // anonymous as well as admin registration
    if (req.method == "POST" && req.baseUrl == "/users") {
      next();
    } else {
      // Bypass auth for now
      //next();
      next(new CustomError("Invalid authentication token", 403))
    }
  }
};


/*
 * Require the requestor to have admin role
 */
exports.requireAdmin = async (req, res, next) => {
  if (req.user.role == 'admin') {
    next();
  } else {
    // Bypass auth for now
    //next();
    next(new CustomError("Not authorized.", 403))
  }
}


/*
 * Require the requestor to have instructor role AND match the instructorId
 * of the requested course.
 */
exports.requireCourseInstructorOrAdmin = async (req, res, next) => {
  if (req.user.role == 'admin' || instructorOwnsCourse(req.user.sub, req.params.id)) {
    next();
  } else {
    // Bypass auth for now
    //next();
    next(new CustomError("Not authorized.", 403))
  }
}

/*
 * Require the student to be enrolled in the requested course.
 */
exports.requireEnrolledStudent = async (req, res, next) => {
  if (studentInCourse(req.user.sub, req.params.id)) {
    next();
  } else {
    // Bypass auth for now
    //next();
    next(new CustomError("Not authorized.", 403))
  }
}