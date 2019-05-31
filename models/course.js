/* @course.js
 *
 * Course model and related functions.
 *
 */


const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");

//
// NOTE: I still need to test the functions that are written
//

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
  const db = getDBReference();
  const collection = db.collection('courses');
  const courseCount = await collection.countDocuments();
  const numPerPage = 5;
  const lastPage = Math.ceil(courseCount / numPerPage);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  const offset = (page - 1) * numPerPage;
  const results = await collection.find({})
    .sort({_id: 1})
    .skip(offset)
    .limit(numPerPage)
    .toArray();

  return {
    courses: results,
    page: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    count: count
  };
};


/*
 * Insert a new course into the DB
 */
exports.insertCourse = async (course) => {
  console.log(" == insertCourse: course", course);
  const db = getDBReference();
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
};


/*
 * Fetch details about a course by Id
 */
exports.getCourseDetailsById = async (id) => {
  console.log(" == getCourseDetailsById: id", id);
  const db = getDBReference();
  const collection = db.collection('courses');
  const results = await collection.find({id}).toArray();
  return results[0];
};


/*
 * Perform partial update of a Course by Id
 */
exports.updateCourse = async (id, course) => {
  console.log(" == updateCourse: course", course);
  return new Promise((resolve, reject) =>{
    const db = getDBReference();
    db.collection('courses', function(err, collection) {
      collection.updateOne({_id: new mongodb.ObjectID(id)}, {
        subject: course.subject,
        number: course.number,
        title: course.title,
        term: course.term,
        instructorId: course.insertedId
      }), function(err, results) {
        if(err)
        {
          console.log(err);
          reject(err);
        }
        console.log("Successfully deleted course id: "+id);
        resolve(results);
      }
    });
  });
};


/*
 * Delete a Course by Id
 */
exports.deleteCourse = async (id) => {
  console.log(" == deleteCourse: id", id);
  return new Promise((resolve, reject) =>{
    const db = getDBReference();
    db.collection('courses', function(err, collection) {
      collection.deleteOne({_id: new mongodb.ObjectID(id)}), function(err, results) {
        if(err)
        {
          console.log(err);
          reject(err);
        }
        console.log("Successfully deleted course id: "+id);
        resolve(results);
      }
    });
  });
  
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
  const db = getDBReference();
  const collection = db.collection('assignments');
  const assignmentCount = await collection.find({courseId: course.id}).countDocuments();
  const numPerPage = 5;
  const lastPage = Math.ceil(assignmentCount / numPerPage);
  page = page < 1 ? 1 : page;
  page = page > lastPage ? lastPage : page;
  const offset = (page - 1) * numPerPage;
  const results = await collection.find({courseId: course.id})
    .sort({_id: 1})
    .skip(offset)
    .limit(numPerPage)
    .toArray();

  return {
    assignments: results,
    page: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    count: count
  };
};


/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorOwnsCourse = async (instructor, course) => {
  console.log(" == instructorOwnsCourse: instructor, course", instructor, course);
  return new Promise((resolve, reject) => {
    const db = getDBReference();
    const collection = db.collection('courses');
    const results = await collection.find({iinstructorId: instructor.id}).toArray();
    if(results.length == 0)
      reject();
    resolve (results[0]);
  });
};


/*
 * Check if a student is enrolled in the specified Course Id
 */

 // I think we are going to need to store students enrolled in a course
 // in the courses collection as an array of id's or something
exports.studentInCourse = async (student, course) => {
  console.log(" == studentInCourse: student, course", student, course);
  return new Promise((resolve, reject) => {
    // Need to make a solution for searching students first.
  });
};
