/* @assignments.js
 *
 * Routes for /assignments
 *
 */

const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const CustomError = require("../lib/custom-error");

const {
  requireAuthentication,
  requireCourseInstructorOrAdmin,
  requireEnrolledStudent
} = require('../lib/auth');

const {
  AssignmentSchema,
  SubmissionSchema,
  insertAssignment,
  getAssignmentDetailsById,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  insertSubmission
} = require('../models/assignment');

const crypto = require('crypto');
const multer = require('multer');

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
                  const ext= crypto.pseudoRandomBytes(8).toString('hex');
                  callback(null, `${req.body.title}${ext}.pdf`);
                },
    fileFilter: (req, file, callback) => {
                  callback(null, true);
                },

  })

});

/*
 * Creates a new assignment.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.post('/', requireAuthentication, requireCourseInstructorOrAdmin, async (req, res, next) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {

       const id = await insertAssignment(req.body);
       res.status(201).send({id: id});

    } catch (err) {
      // Throw a 500 for all errors incuding DB issues
      next(new CustomError("Error adding assignment.", 500));
    }

  } else {
    next(new CustomError("Request is not Valid", 400));
  }
});


/*
 * Fetches information about an assignment, excluding submissions
 */
router.get('/:id', async (req, res, next) => {
   try {
      const assignment = await getAssignmentDetailsById(req.params.id);

      res.status(201).send(assignment);

   } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Assignment not found.", 404));
   }
});


/*
 * Partial update of an assignment.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.patch('/:id', requireAuthentication, requireCourseInstructorOrAdmin, async (req, res, next) => {
  // Needs modifications to work with partial PATCH
 //if (validateAgainstSchema(req.body, AssignmentSchema)) {
   try {

      const assignment = await updateAssignment(req.params.id, req.body);
      res.status(200).send(assignment);

   } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Assignment not found.", 404));
   }

 // } else {
 //   next(new CustomError("Request is not Valid", 400));
 // }
});


/*
 * Delete an assignment.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.delete('/:id', requireAuthentication, requireCourseInstructorOrAdmin, async (req, res, next) => {

   try {

      const id = await deleteAssignment(req.params.id);
      res.status(204).send(id);

   } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Assignment not found.", 404));
   }
});


/*
 * Fetch the submissions for an assignment. Results should be paginated.
 * requireAuthentication  - Need a valid token
 * requireCourseInstructorOrAdmin - must be Admin or Instructor of the course
 *
 */
router.get('/:id/submissions', requireAuthentication, requireCourseInstructorOrAdmin, async (req, res, next) => {

   try {
     // Extract paramenters
     const studentId = req.query.studentId;
     const page = parseInt(req.query.page) || 1;
     const submissions = await getAssignmentSubmissions(req.params.id, studentId, page);

     res.status(200).json(submissions);

   } catch (err) {
     console.log(err);
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Assignment not found.", 404));
   }
});


/*
 * Create a new submission for an assignment.
 * requireAuthentication  - Need a valid token
 * requireEnrolledStudent - Student must be enrolled in course
 * upload.single('pdf')
 */
router.post('/:id/submissions', requireAuthentication, requireEnrolledStudent, async (req, res, next) => {
  if (validateAgainstSchema(req.body, SubmissionSchema) && req.params.id === req.body.assignmentId) {
    try {
      const id = await insertSubmission(req.body);
      res.status(201).send({id: id});

    } catch (err) {
     // Throw a 404 for all errors incuding DB issues
     next(new CustomError("Assignment not found.", 404));
    }
  } else {
   next(new CustomError("Request is not Valid", 400));
  }
});

module.exports = router;
