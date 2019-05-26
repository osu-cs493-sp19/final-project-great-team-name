/* @assignment.js
 *
 * Assignment & submission models and related functions.
 *
 */

const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");

/*
* Schema describing required/optional fields of a Assignment object.
*/
const AssignmentSchema = {
 courseId: { required: true },
 title: { required: true },
 points: { required: true },
 due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;


/*
* Schema describing required/optional fields of a Submission object.
*/
const SubmissionSchema = {
 assignmentId: { required: true },
 studentId: { required: true },
 timestamp: { required: false }, // This should be calculated?
 file: { required: true }
};
exports.SubmissionSchema = SubmissionSchema;


/*
 * Creates a new assignment object in the DB & returns Id
 */
exports.insertAssignment = async (assignment) => {
  console.log(" == insertAssignment: assignment", assignment);

  return "123";
}


/*
 * Fetch details about an assignment by Id
 */
exports.getAssignmentDetailsById = async (id) => {
  console.log(" == getAssignmentDetailsById: id", id);

  return {};
}


/*
 * Partial update of an Assignment by Id
 */
exports.updateAssignment = async (id, assignment) => {
  console.log(" == updateAssignment: id,assignment", id,assignment);

  return {};
}

/*
 * Delete an Assignment by Id
 */
exports.deleteAssignment = async (id) => {
  console.log(" == deleteAssignment: id", id);

  return {};
}


/*
 * Fetch paginated list of submissions by Assignment Id
 */
exports.getAssignmentSubmissions = async (id, studentId, page) => {
  console.log(" == getAssignmentSubmissions: id,studentId,page", id,studentId,page);

  return {};
}


/*
 * Insert a new submission for an Assignment
 */
exports.insertSubmission = async (id, submission) => {
  console.log(" == insertSubmission: id, submission", id, submission);

  return {};
}
