/* @course.js
 *
 * Course model and related functions.
 *
 */


const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");


const { getDBReference, _ID } = require ('../lib/mongo');

//
// NOTE: Still need to do the two roster functions and then test my changes
//

/*
 * Schema describing required/optional fields of a Course object.
 */
const CourseSchema = {
 subject: { required: true },
 number: { required: true },
 title: { required: true },
 term: { required: true },
 instructorId: { required: true },
 students: {required: false}
 // list of students
 // list of assignments
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

// Variable to control page size
const PAGE_SIZE = 3;


/*
 * Fetch paginated list of courses
 * Do not return students or assignments/submissions.
 */
exports.getCourses = async (page, subject, number, term) => {
  try
  {
    console.log(" == getCourses: page,subject,number,term", page,subject,number,term);
    const collection = getDBReference().collection('courses');
    const courseCount = await collection.find({ $and: [ {subject: subject}, {number: number}, {term: term}]}).countDocuments();
    const PAGE_SIZE = 5;
    const lastPage = Math.ceil(courseCount / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * PAGE_SIZE;
    const results = await collection.find({ $and: [ {subject: subject}, {number: number}, {term: term}]})
      .sort({_id: 1})
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray();
  
    return {
      courses: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count
    };
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  getCourses()");
    console.log(err);
  }

};

exports.getAllCourses = async (page) => {
  console.log(" == Getting All Courses");
  try
  {
    console.log(" == getCourses: page,subject,number,term", page,subject,number,term);
    const collection = getDBReference().collection('courses');
    const courseCount = await collection.countDocuments();
    const lastPage = Math.ceil(courseCount / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * PAGE_SIZE;
    const results = await collection.find({})
      .sort({_id: 1})
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray();
  
    return {
      courses: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count
    };
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  getAllCourses()");
    console.log(err);
  }
};


/*
 * Insert a new course into the DB
 */
exports.insertCourse = async (course) => {
  try
  {
    console.log(" == Inserting Course:", course);
    const courseFields = extractValidFields(course, CourseSchema);
    const collection = getDBReference().collection('courses');
    const result = await collection.insertOne(courseFields);
    console.log(result);
    console.log(" == Course Inserted With ID: ", result.insertedId);
    return result.insertedId;
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  insertCourse()");
    console.log(err);
  }
  
};


/*
 * Fetch details about a course by Id
 */
exports.getCourseDetailsById = async (id) => {
  try
  {
    console.log(" == Getting Course Details By ID: ", id);
    const collection = getDBReference().collection('courses');
    var result = await collection.findOne({ _id: new _ID(id)});
    return result;
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  getCourseDetailsById()");
    console.log(err);
  }
};


/*
 * Perform partial update of a Course by Id
 */
exports.updateCourse = async (id, patch) => {
  try
  {
    console.log(" == Updating Course ID: ", id);
    const collection = getDBReference.collection('courses');
    var result = await collection.findOneAndUpdate(
      { _id: new _ID(id)},
      {$set: patch},
      {returnNewDocument:true},
    );
    console.log(" == Updated Course:", result);
    return result;
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  updateCourse()");
    console.log(err);
  }

};


/*
 * Delete a Course by Id
 */
exports.deleteCourse = async (id) => {
  try
  {
    console.log(" == Deleting Course ID: ", id);
    const collection = getDBReference().collection('courses');
    var result = await collection.remove(
      { _id: new _ID(id)},
      { justOne: true},
    );
    console.log(" == Deleted Assignment ID: ${id}, Result:${result.result}");
    if(result.result.n > 0)
    {
      return result.result;
    }
    else
    {
      console.log(" !!! Error in /models/courses.js  :  deleteCourse()");
      throw new CustomError("Delete Course Error, No Record For Course ID:${id}", 404);
    }
  }
  catch(err)
  {
    console.log(err);
  }
};


/*
 * Fetch the student roster of a course by Id
 */
exports.getCourseRoster = async (courseId) => {
  try
  {
    console.log(" == Fetching Roster For Course ID:${course.id}");
    const collection = getDBReference().collection('courses');
    const course = await collection.findOne({ _id: new _ID(courseId)});
    var i;
    var students = course.students;
    var userObjects = [];
    for(i = 0; i < students.length; i++)
    {
      var myUser = getUserDetailsById(students[i]);
      userObjects.push(myUser);
    }
    
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  getCourseRoster()");
    console.log(err);
  }
};


/*
 * Add/Remove students from the Course roster by Id
 */
exports.updateCourseRoster = async (courseId, roster) => {
  try
  {
    console.log(" == Updating Roster For Course ID:${course.id}", roster);
    const addStudents = roster.add;
    const remStudents = roster.remove;
    var i;
    for(i = 0; i < addStudents.length; i++)
    {
      await this.addStudentToCourse(addStudents[i], courseId);
    }
    for(i = 0; i < remStudents.length; i++)
    {
      await this.removeStudentFromCourse(remStudents[i], courseId);
    }
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  updateCourseRoster()");
    console.log(err);
  }
};


/*
 * Fetch assignments for the Course by Id
 */
exports.getCourseAssignments = async (id, page) => {

  try
  {
    console.log(" == Getting Assignments For Course ID:", id);
    const collection = getDBReference().collection('assignments');
    const assignmentCount = await collection.find({courseId: course.id}).countDocuments();
    console.log(" == Reading ${assignmentCount} Assignments for Course ID: ", id);
    const lastPage = Math.ceil(assignmentCount / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * PAGE_SIZE;
    const results = await collection.find({courseId: new _ID(course.id)})
      .sort({_id: 1})
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray();
  
    return {
      assignments: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count
    };

  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  getCourseAssignments()");
    console.log(err);
  }
};


/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorOwnsCourse = async (instructor, course) => {
  try
  {
    console.log(" == Checking if Instructor ID:${instructor.id} owns Course ID: ${course.id}");
    const collection = getDBReference().collection('courses');
    const results = await collection.find(
      {
        $and: 
        [
          { _id: new _ID(course.id)}, 
          {instructorId: new _ID(instructor.id)}
        ]
      }).toArray();
    if(results.length == 0)
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  instructorOwnsCourse()");
    console.log(err);
  }
};

/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorIdOwnsCourseId = async (instructorId, courseId) => {
  try
  {
    console.log(" == Checking if Instructor ID:${instructor.id} owns Course ID: ${course.id}");
    const collection = getDBReference().collection('courses');
    const results = await collection.find(
      {
        $and:[
          { instructorId: new _ID(instructorId)},
          { _id: new _ID(courseId)}
        ]
      }).toArray();
    if(results.length == 0)
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  instructorIdOwnsCourseId()");
    console.log(err);
  }
};




/*
 * Check if a student is enrolled in the specified Course Id
 */

 // I think we are going to need to store students enrolled in a course
 // in the courses collection as an array of id's or something
exports.studentInCourse = async (user, course) => {
  try
  {
    console.log(" == Checking if Student ID:${user.id} is Enrolled In Course ID:${course.id}");
    const collection = getDBReference().collection('courses');
    const course = await collection.findOne({ _id: new _ID(course.id)});
    var i;
    var students = course.students;
    for(i = 0; i < students.length; i++)
    {
      if(students[i] == user.id)
        foundStudent = true;
    }
    return foundStudent;
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  studentInCourse()");
    console.log(err);
  }
};


exports.studentIdInCourseId = async (studentId, courseId) => {
  try
  {
    console.log(" == Checking if Student ID:${studentId} is Enrolled In Course ID:${courseId}");
    const collection = getDBReference().collection('courses');
    const course = await collection.findOne({ _id: new _ID(courseId)});
    var i;
    var students = course.students;
    for(i = 0; i < students.length; i++)
    {
      if(students[i] == studentId)
        foundStudent = true;
    }
    return foundStudent;
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  studentIdInCourseId()");
    console.log(err);
  }
};


exports.addStudentToCourse = async (studentId, courseId) => {
  try
  {
    console.log(" == Adding Student ID:${user.id} to Course ID:${courseId}");
    var studentInClass = await this.studentIdInCourseId(studentId, courseId);
    if(studentInClass)
    {
      console.log("Add Student To Course Failure, Student ID:${studentId} is Already Enrolled In Course ID:${courseId}");
      return false;
    }
    const collection = getDBReference().collection('courses');
    const course = await collection.findOne({ _id: new _ID(courseId)});
    var students = course.students;
    if(students)
    {
      students.push(studentId);
    }
    else
    {
      students = [];
      students.push(studentId);
    }
    var updatedCourse = await collection.findOneAndUpdate(
      { _id: new _ID(courseId)},
      {students: students},
      {returnNewDocument: true}
    );
    
    console.log(" == Added Student ID:${studentId} to Course ID:${courseId}");
    return updatedCourse;

    
  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  addStudentToCourse()");
    console.log(err);
  }
};


exports.removeStudentFromCourse = async (studentId, courseId) => {
  try
  {
    console.log(" == Removing Student ID:${studentId} from Course ID:${courseId}");
    var studentInCourse = await this.studentIdInCourseId(studentId, courseId);
    if(studentInCourse == false)
    {
      console.log("Remove Student From Course Failure, Student ID:${studentId} is Already Enrolled In Course ID:${courseId}");
      return false;
    }
    const collection = getDBReference().collection('courses');
    const course = await collection.findOne({ _id: new _ID(courseId)});
    var i;
    var newStudents = [];
    var students = course.students;  
    for(i = 0; i < students.length; i++)
    {
      if(students[i] != studentId)
        newStudents.push(students[i]);
    }
    var updatedCourse = await collection.findOneAndUpdate(
      { _id: new _ID(courseId)},
      {students: newStudents},
      {returnNewDocument: true}
    );
    console.log(" == Removed Student ID:${studentId} to Course ID:${courseId}");
    return updatedCourse;

  }
  catch(err)
  {
    console.log(" !!! Error in /models/courses.js  :  removeStudentFromCourse()");
    console.log(err);
  }
};