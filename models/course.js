/* @course.js
 *
 * Course model and related functions.
 *
 */


const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");


/*
* Schema describing required/optional fields of a Course object.
*/
const CourseSchema = {
 subject: { required: true },
 number: { required: true },
 title: { required: true },
 term: { required: true },
 instructorId: { required: true }
};
exports.CourseSchema = CourseSchema;

/*
* Schema describing required/optional fields for a Course roster update.
*/
const RosterSchema = {
 add: { required: true },
 remove: { required: true }
};
exports.RosterSchema = RosterSchema;


/*
 * Fetch paginated list of courses
 * Do not return students or assignments/submissions.
 */
exports.getCourses = async (page, subject, number, term) => {
  console.log(" == getCourses: page,subject,number,term", page,subject,number,term);

  return {};
};


/*
 * Insert a new course into the DB
 */
exports.insertCourse = async (course) => {
  console.log(" == insertCourse: course", course);

  return "123";
};


/*
 * Insert a new course into the DB
 */
exports.getCourseDetailsById = async (id) => {
  console.log(" == getCourseDetailsById: id", id);

  return {};
};


/*
 * Insert a new course into the DB
 */
exports.updateCourse = async (id, course) => {
  console.log(" == updateCourse: course", course);

  return true;
};


/*
 * Insert a new course into the DB
 */
exports.deleteCourse = async (id) => {
  console.log(" == deleteCourse: id", id);

  return true;
};


/*
 * Insert a new course into the DB
 */
exports.getCourseRoster = async (course) => {
  console.log(" == getCourseRoster: course", course);

  return {};
};


/*
 * Insert a new course into the DB
 */
exports.updateCourseRoster = async (course, updates) => {
  console.log(" == updateCourseRoster: course, updates", course, updates);

  return true;
};


/*
 * Insert a new course into the DB
 */
exports.getCourseAssignments = async (course) => {
  console.log(" == getCourseAssignments: course", course);

  return true;
};


/*
 * Check if an instructor owns the specified course
 */
exports.instructorOwnsCourse = async (instructor, course) => {
  console.log(" == instructorOwnsCourse: instructor, course", instructor, course);

  return true;
};

/*
 * Check if an student is enrolled in a course
 */
exports.studentInCourse = async (student, course) => {
  console.log(" == studentInCourse: student, course", student, course);

  return true;
};
