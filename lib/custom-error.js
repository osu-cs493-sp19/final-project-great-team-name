/* @file custom-error.js
 *
 * Custom Error handler that can accept a HTTP status code as well as a status
 * message.
 */

'use strict';

module.exports = function CustomError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.code = code;
};

require('util').inherits(module.exports, Error);
