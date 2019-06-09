/* @courses.js
 *
 * Routes for /courses
 *
 */

const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { requireAuthentication, requireAdmin, requireCourseInstructorOrAdmin } = require('../lib/auth');
const CustomError = require("../lib/custom-error");

const {
  CourseSchema,
  RosterSchema,
  StudentSchema,
  getCourses,
  getAllCourses,
  insertCourse,
  getCourseDetailsById,
  updateCourse,
  deleteCourse,
  getCourseRoster,
  updateCourseRoster,
  getCourseAssignments,
  instructorOwnsCourse,
  instructorIdOwnsCourseId,
  studentIdInCourseId,
  addStudentToCourse,
  getStudentsCSV,
  removeStudentFromCourse,
  getStudentsInCourse,




} = require('../models/course');


/*
 * Fetches a list of courses. Results should be paginated.
 * No enrollment or assignments/submissions should be returned.
 */
router.get('/', async (req, res, next) => {
  try {
    // Extract paramenters
    //const subject = req.query.subject;
    //const number = req.query.number;
    //const term = req.query.term;
    //const page = parseInt(req.query.page);
    const courses = getAllCourses(1);

    res.status(200).send(courses);

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("No courses found.", 404));
  }
});


/*
 * Create a new course
 * requireAuthentication  - Need a valid token
 * requireAdmin - must have Admin Role
 *
 */
router.post('/', /*requireAuthentication, requireAdmin,*/ async (req, res, next) => {
 //if (validateAgainstSchema(req.body, CourseSchema)) {
   try {

     const id = await insertCourse(req.body);

     res.status(201).send({id: id});

   } catch (err) {
     // Throw a 500 for all errors incuding DB issues
     next(new CustomError("Error adding course.", 500));
   }
 //} else {
 // next(new CustomError("Request is not Valid", 400));
 //}
});


/*
 * Fetches course details.
 * No enrollment or assignments/submissions should be returned.
 */
router.get('/:id', async (req, res, next) => {
  try {

    const course = await getCourseDetailsById(req.params.id);

    res.status(200).send(course);

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("Course not found.", 404));
  }
});


/*
* Perform a partial update of a Course.
* requireAuthentication  - Need a valid token
* requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
*
*/
router.patch('/:id', requireAuthentication, requireCourseInstructorOrAdmin, async (req, res, next) => {
  // Needs modifications to work with partial PATCH
  //if (validateAgainstSchema(req.body, CourseSchema)) {
    try {

      const id = await updateCourse(req.params.id, req.body);

      res.status(200).send({});

    } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Course not found.", 404));
    }
  // } else {
  //   next(new CustomError("Request is not Valid", 400));
  // }
});


 /*
  * Delete a course
  * requireAuthentication  - Need a valid token
  * requireAdmin - must have Admin Role
  *
  */
router.delete('/:id', requireAuthentication, requireAdmin, async (req, res, next) => {

  try {

    const id = await deleteCourse(req.params.id);
    res.status(204).send({});

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("Course not found.", 404));
  }
});


/*
 * Fetch the userIds for students in a course.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.get('/:id/students', /*requireAuthentication, requireCourseInstructorOrAdmin,*/ async (req, res, next) => {

  try {
    const roster = await getStudentsInCourse(req.params.id, 1);

    res.status(200).send(roster);

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("Course not found.", 404));
  }
});


/*
 * Enrolls or removes a student from the roster of a course.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.post('/:id/students', /*requireAuthentication, requireCourseInstructorOrAdmin,*/ async (req, res, next) => {
  //if (validateAgainstSchema(req.body, RosterSchema)) {
    try {

      await updateCourseRoster(req.params.id, req.body);

      res.status(200).send({});

    } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Course not found.", 404));
    }
  //} else {
   // next(new CustomError("Request is not Valid", 400));
  //}
});


/*
 * Download the course roster in CSV format
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.get('/:id/roster', /*requireAuthentication, requireCourseInstructorOrAdmin,*/ async (req, res, next) => {

  try {

    // Fetch the coster
    const roster = await getStudentsCSV(req.params.id);

    // convert to csv and stream file
    const csv = "name, id, email";

    res.status(200).send(roster);

  } catch (err) {
    // Throw a 404 for all errors incuding DB issues
    next(new CustomError("Assignment not found.", 404));
  }
});


/*
 * Fetch the assignments Ids for a course.
 */
router.get('/:id/assignments', async (req, res, next) => {

   try {

     const assignments = await getCourseAssignments(req.params.id);

     res.status(200).send(assignments);

   } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Course not found.", 404));
   }
});


module.exports = router;
