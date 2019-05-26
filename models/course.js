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
 * Fetch details about a course by Id
 */
exports.getCourseDetailsById = async (id) => {
  console.log(" == getCourseDetailsById: id", id);

  return {};
};


/*
 * Perform partial update of a Course by Id
 */
exports.updateCourse = async (id, course) => {
  console.log(" == updateCourse: course", course);

  return true;
};


/*
 * Delete a Course by Id
 */
exports.deleteCourse = async (id) => {
  console.log(" == deleteCourse: id", id);

  return true;
};


/*
 * Fetch the student roster of a course by Id
 */
exports.getCourseRoster = async (course) => {
  console.log(" == getCourseRoster: course", course);

  return {};
};


/*
 * Add/Remove students from the Course roster by Id
 */
exports.updateCourseRoster = async (course, updates) => {
  console.log(" == updateCourseRoster: course, updates", course, updates);

  return true;
};


/*
 * Fetch assignments for the Course by Id
 */
exports.getCourseAssignments = async (course) => {
  console.log(" == getCourseAssignments: course", course);

  return {};
};


/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorOwnsCourse = async (instructor, course) => {
  console.log(" == instructorOwnsCourse: instructor, course", instructor, course);

  return true;
};


/*
 * Check if a student is enrolled in the specified Course Id
 */
exports.studentInCourse = async (student, course) => {
  console.log(" == studentInCourse: student, course", student, course);

  return true;
};
