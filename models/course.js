/* @course.js
 *
 * Course model and related functions.
 *
 */


const { extractValidFields } = require('../lib/validation');
const CustomError = require("../lib/custom-error");
const { Parser } = require('json2csv');

const { getDBReference, _ID } = require ('../lib/mongoDB');

const {
  getUserDetailsById,
} = require('../models/user');

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
 instructorId: { required: false },
};
exports.CourseSchema = CourseSchema;


/*
 * Schema describing required/optional fields for a Course roster update.
 */
const RosterSchema = {
 add: { required: false },
 remove: { required: false }
};
exports.RosterSchema = RosterSchema;


const StudentSchema = {
  studentId: {required: true},
  courseId: {required: true}
};
exports.StudentSchema = StudentSchema;

// Variable to control page size
const PAGE_SIZE = 3;


/*
 * Fetch paginated list of courses
 * Do not return students or assignments/submissions.
 */
exports.getCourses = async (page, subject, number, term) => {
  try
  {
    console.log(` == getCourses: ${page}, ${subject}, ${number}, ${term}`);
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

    const pagLinks = {};
    if(page < lastPage) 
    {
      pagLinks.nextPage = `/courses?page=${page + 1}`;
      pagLinks.lastPage = `/courses?page=${lastPage}`;
    }
    if(page > 1) 
    {
      pagLinks.prevPage = `/courses?page=${page - 1}`;
      pagLinks.firstPage = '/courses?page=1';
    }
  
    return {
      courses: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count,
      links: pagLinks
    };
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getCourses()`);
    console.log(err);
  }

};

exports.getAllCourses = async (page) => {
  console.log(` == Getting All Courses`);
  try
  {
    console.log(` == getCourses: ${page}, ${subject}, ${number}, ${term}`);
    const collection = getDBReference().collection('courses');
    const courseCount = await collection.countDocuments();
    const lastPage = Math.ceil(courseCount / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * PAGE_SIZE;
    var end = start + pageSize;
    end = end > results.length ? results.length : end;
    const results = await collection.find({})
      .sort({_id: 1})
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray();

    const pagLinks = {};
    if(page < lastPage) 
    {
      pagLinks.nextPage = `/courses?page=${page + 1}`;
      pagLinks.lastPage = `/courses?page=${lastPage}`;
    }
    if(page > 1) 
    {
      pagLinks.prevPage = `/courses?page=${page - 1}`;
      pagLinks.firstPage = '/courses?page=1';
    }
  
    return {
      courses: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count,
      links: pagLinks
    };
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getAllCourses()`);
    console.log(err);
  }
};


/*
 * Insert a new course into the DB
 */
exports.insertCourse = async (course) => {
  try
  {
    console.log(` == Inserting Course: ${course}`);
    const courseFields = extractValidFields(course, CourseSchema);
    const collection = getDBReference().collection('courses');
    const result = await collection.insertOne(courseFields);
    console.log(result);
    console.log(` == Course Inserted With ID: `, result.insertedId);
    return result.insertedId;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  insertCourse()`);
    console.log(err);
  }
  
};


/*
 * Fetch details about a course by Id
 */
exports.getCourseDetailsById = async (id) => {
  try
  {
    console.log(` == Getting Course Details By ID: ${id}`);
    if(!_ID.isValid(id))
    {
      console.log(` == Invalid ID in getCourseDetailsById: `, id);
      return null;
    }
    const collection = getDBReference().collection('courses');
    var result = await collection.findOne({ _id: new _ID(id)});
    return result;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getCourseDetailsById()`);
    console.log(err);
  }
};


/*
 * Perform partial update of a Course by Id
 */
exports.updateCourse = async (id, patch) => {
  try
  {
    console.log(` == Updating Course ID: ${id}`);
    console.log(` == Patch Contents: ${patch}`);
    const collection = getDBReference.collection('courses');
    var result = await collection.findOneAndUpdate(
      { _id: new _ID(id)},
      {$set: patch},
      {returnNewDocument:true},
    );
    console.log(` == Updated Course:`, result);
    return result;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  updateCourse()`);
    console.log(err);
  }

};


/*
 * Delete a Course by Id
 */
exports.deleteCourse = async (id) => {
  try
  {
    console.log(` == Deleting Course ID: ${id}`);
    const collection = getDBReference().collection('courses');
    var result = await collection.remove(
      { _id: new _ID(id)},
      { justOne: true},
    );
    console.log(` == Deleted Assignment ID: ${id}, Result:${result.result}`);
    if(result.result.n > 0)
    {
      return result.result;
    }
    else
    {
      console.log(` !!! Error in /models/courses.js  :  deleteCourse()`);
      throw new CustomError(`Delete Course Error, No Record For Course ID:${id}`, 404);
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
    console.log(` == Fetching Roster For Course ID:${course.id}`);
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
    console.log(` !!! Error in /models/courses.js  :  getCourseRoster()`);
    console.log(err);
  }
};


/*
 * Add/Remove students from the Course roster by Id
 */
exports.updateCourseRoster = async (courseId, roster) => {
  try
  {
    console.log(` == Updating Roster For Course ID:${course.id} Roster: ${roster}`);
    const addStudents = roster.add;
    const remStudents = roster.remove;
    var i;
    if(addStudents)
    {
      for(i = 0; i < addStudents.length; i++)
      {
        await this.addStudentToCourse(addStudents[i], courseId);
      }
    }
    if(remStudents)
    {
      for(i = 0; i < remStudents.length; i++)
      {
        await this.removeStudentFromCourse(remStudents[i], courseId);
      }
    }
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  updateCourseRoster()`);
    console.log(err);
  }
};


/*
 * Fetch assignments for the Course by Id
 */
exports.getCourseAssignments = async (id, page) => {

  try
  {
    console.log(` == Getting Assignments For Course ID: ${id}`);
    const collection = getDBReference().collection('assignments');
    const assignmentCount = await collection.find({courseId: course.id}).countDocuments();
    console.log(` == Reading ${assignmentCount} Assignments for Course ID: `, id);
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
    console.log(` !!! Error in /models/courses.js  :  getCourseAssignments()`);
    console.log(err);
  }
};


/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorOwnsCourse = async (instructor, course) => {
  try
  {
    console.log(` == Checking if Instructor ID:${instructor.id} owns Course ID: ${course.id}`);
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
    console.log(` !!! Error in /models/courses.js  :  instructorOwnsCourse()`);
    console.log(err);
  }
};

/*
 * Check if an instructor owns the specified Course Id
 */
exports.instructorIdOwnsCourseId = async (instructorId, courseId) => {
  try
  {
    console.log(` == Checking if Instructor ID:${instructor.id} owns Course ID: ${course.id}`);
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
    console.log(` !!! Error in /models/courses.js  :  instructorIdOwnsCourseId()`);
    console.log(err);
  }
};



exports.studentIdInCourseId = async (studentId, courseId) => {
  try
  {
    console.log(` == Checking if Student ID:${studentId} is Enrolled In Course ID:${courseId}`);
    const collection = getDBReference().collection('students');
    const student = await collection.findOne(
      { 
        $and: [ 
          {studentId: studentId}, 
          {courseId: courseId}, 
        ]
      }
    );
    if(student)
      return true;
    return false;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  studentIdInCourseId()`);
    console.log(err);
  }
};


exports.addStudentToCourse = async (studentId, courseId) => {
  try
  {
    const collection = getDBReference().collection('students');
    const usr = await getUserDetailsById(studentId); 
    const student = {
      studentId: new _ID(usr.id),
      courseId: courseId
    };
    const result = await collection.insertOne(student);

    console.log(` == Added Student ID:${studentId} to Course ID:${courseId}`);
    return result.insertedId;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  addStudentToCourse()`);
    console.log(err);
  }
};

exports.getStudentsCSV = async (courseId) =>
{
  try
  {
    console.log(` == Getting CSV for Course ID: ${courseId}`);
    const collection = getDBReference().collection('students');
    const students = collection.find({courseId: new _ID(courseId)}).toArray();
    var i;
    var results = [];
    for(i = 0; i < students.length; i++)
    {
      const usr = await getUserDetailsById(students[i].studentId);
      results[i] = usr;
    }
    const fields = ['_id', 'name', 'email', 'password', 'role'];
    const jsonParser = new Parser({fields});
    const csv = jsonParser.parse(results);
    return csv;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getStudentsCSV()`);
    console.log(err);
  }
}


exports.removeStudentFromCourse = async (studentId, courseId) => {
  try
  {
    console.log(` == Removing Student ID:${studentId} from Course ID:${courseId} `);
    const collection = getDBReference().collection('students');
    var result = await collection.remove(
      { 
        $and: [ 
          {studentId: studentId}, 
          {courseId: courseId}, 
        ]
      }
    );
    return result;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  removeStudentFromCourse()`);
    console.log(err);
  }
};


exports.getStudentsInCourse = async (courseId, page) =>
{
  try
  {
    console.log(` == Getting List Of Students In Course ID:${courseId} `);
    const collection = getDBReference().collection('students');
    const count = await collection.find({courseId: new _ID(courseId)}).countDocuments();
  
    const lastPage = Math.ceil(count / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const start = (page - 1) * PAGE_SIZE;
  
    const results = await collection.find({courseId: new _ID(courseId)})
      .sort({ _id: 1 })
      .skip(start)
      .limit(PAGE_SIZE)
      .toArray();
  
    const pagLinks = {};
  
    if (page < lastPage) {
      pagLinks.nextPage = `/students?page=${page + 1}`;
      pagLinks.lastPage = `/students?page=${lastPage}`;
    }
    if (page > 1) {
      pagLinks.prevPage = `/students?page=${page - 1}`;
      pagLinks.firstPage = '/students?page=1';
    }
  
    return {
      students: results,
      page: page,
      totalPages: lastPage,
      pageSize: PAGE_SIZE,
      count: count,
      links: pagLinks
    };
    
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getStudentsInCourse()`);
    console.log(err);
  }
 
}