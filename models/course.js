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


// TODO: needs work
/*
 * Fetch paginated list of courses
 * Do not return students or assignments/submissions.
 */
exports.getCourses = async (page, subject, number, term) => {
  try
  {
    console.log(` == getCourses: ${page}, ${subject}, ${number}, ${term}`);
    const collection = getDBReference().collection('courses');
    var tempCourses = await collection.find({}).toArray();
    if(!tempCourses)
    {
      return({});
    }
    var i;
    var courses = [];
    for(i = 0; i < tempCourses.length; i++)
    {
      if(subject)
      {
        if(tempCourses[i].subject != subject)
          continue;
      }
      if(number)
      {
        if(tempCourses[i].number != number)
          continue;
      }
      if(term)
      {
        if(tempCourses[i].term != term)
          continue;
      }
      courses.push(tempCourses[i]);
    }

    var courseCount = courses.length;
    console.log(`=== Course Count: ${courseCount}` );
    if(courseCount == 0)
    {
      return({});
    }
    const lastPage = Math.ceil(courseCount / PAGE_SIZE);
    if(!page)
      page = 0;
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * PAGE_SIZE;
    var results = [];

    for(i = offset; i < (offset + PAGE_SIZE); i++)
    {
      if(courses[i] != null)
        results.push(courses[i]);
    }

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
      count: courseCount,
      links: pagLinks
    };
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getCourses()`);
    console.log(err);
    return({error: "There was a problem getting the course list"});
  }

};

exports.getAllCourses = async (page) => {
  console.log(` == Getting All Courses`);
  try
  {
    console.log(` == getAllCourses:`);
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
      count: courseCount,
      links: pagLinks
    };
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getAllCourses()`);
    console.log(err);
    return({error: "there was a problem getting all the courses"});
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
    console.log(` == Course: ${courseFields.subject}, ${courseFields.number}, ${courseFields.title}, ${courseFields.term}, ${courseFields.instructorId} `);
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
    return({error: "There was a problem inserting the course"});
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
      return ({error: "The id supplied is not valid"});
    }
    const collection = getDBReference().collection('courses');
    var result = await collection.findOne({ _id: new _ID(id)});
    if(result)
      console.log(` == Course: ${result.subject}, ${result.number}, ${result.title}, ${result.term}, ${result.instructorId} `);
    else
      console.log(` == Course ID: ${id} not found`)
    return result;
    
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getCourseDetailsById()`);
    console.log(err);
    return({error: "There was a problem getting course details for the id"});
  }
};


/*
 * Perform partial update of a Course by Id
 */
exports.updateCourse = async (id, patch) => {
  try
  {
    console.log(` == Updating Course ID: ${id}`);
    console.log(` == Patch Contents: ${patch.title}`);
    const collection = getDBReference().collection('courses');
    var result;
    result = await collection.findOneAndUpdate(
      { _id: new _ID(id)},
      {$set: patch},
      {returnOriginal:false}
    );
    console.log(` == Updated Course:`, result);
    return result.value;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  updateCourse()`);
    console.log(err);
    return({error: "There was a problem updating the course"});
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
    var result = await collection.deleteOne(
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
      return({error: "404, resource not found"});
      throw new CustomError(`Delete Course Error, No Record For Course ID:${id}`, 404);
      
    }
  }
  catch(err)
  {
    console.log(err);
    return({error: "There was a problem deleting the course"});
  }
};


/*
 * Fetch the student roster of a course by Id
 */
exports.getCourseRoster = async (courseId) => {
  try
  {
    console.log(` == Fetching Roster For Course ID:${courseId}`);
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
    return({error: "There was a problem getting the course roster"});
  }
};


/*
 * Add/Remove students from the Course roster by Id
 */
exports.updateCourseRoster = async (courseId, roster) => {
  try
  {
    console.log(` == Updating Roster For Course ID:${courseId} Roster: ${roster}`);
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
    return({error: "There was an error updating the course roster"});
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
    const assignments = await collection.find({courseId: id}).toArray();
    if(assignments)
    {
      if(assignments.length == 0)
      {
        return({});
      }
      var assignmentIds = [];
      var i;
      for(i = 0; i < assignments.length; i++)
      {
        assignmentIds.push(assignments[i]._id);
      }
      return(assignmentIds);

  }
  else
  {
    return({error: "There was a problem getting the course assignments"});
  }

  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getCourseAssignments()`);
    console.log(err);
    return({error: "There was a problem getting the course assignments"})
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
        _id: new _ID(course.id), 
        instructorId: instructor.id
        
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
    return false;
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
          { instructorId: instructorId},
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
    return false;
  }
};



exports.studentIdInCourseId = async (studentId, courseId) => {
  try
  {
    console.log(` == Checking if Student ID:${studentId} is Enrolled In Course ID:${courseId}`);
    const collection = getDBReference().collection('students');
    const student = await collection.findOne(
      { 
        studentId: studentId, 
          courseId: courseId, 
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
    return false;
  }
};


exports.addStudentToCourse = async (studentId, courseId) => {
  try
  {
    const collection = getDBReference().collection('students');
    const usr = await getUserDetailsById(studentId); 
    const student = {
      studentId: usr._id,
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
    return("500");
  }
};

exports.getStudentsCSV = async (courseId) =>
{
  try
  {
    console.log(` == Getting CSV for Course ID: ${courseId}`);
    const collection = getDBReference().collection('students');
    const students = await this.getAllStudentsInCourse(courseId);
    if(students)
    {
      for(i = 0; i < students.length; i++)
      {
        console.log(` ======= LIST OF STUDENS: ${students[i]}`);
        const usr = await getUserDetailsById(students[i]); 
        students[i] = usr;
      }
      const fields = ['_id', 'name', 'email', 'password', 'role'];
      const jsonParser = new Parser({fields});
      const csv = jsonParser.parse(students);
      return csv;
    }
    else
    {
      return({error: "There was a problem getting students for this course"});
    }

  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getStudentsCSV()`);
    console.log(err);
    return({error: "There was a problem getting the CSV"});
  }
}


exports.removeStudentFromCourse = async (studentId, courseId) => {
  try
  {
    console.log(` == Removing Student ID:${studentId} from Course ID:${courseId} `);
    const collection = getDBReference().collection('students');
    var result = await collection.deleteOne(
      { 
        studentId: new _ID(studentId), 
        courseId: courseId, 
      }
    );
    return result;
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  removeStudentFromCourse()`);
    console.log(err);
    return("500");
  }
};

exports.getAllStudentsInCourse = async (courseId) =>
{
  try
  {
    console.log(` == Getting All Students In Course ID:${courseId} `);
    const collection = getDBReference().collection('students');
    const students = await collection.find({}).sort({ _id: 1 }).toArray();
    console.log(` == Students: ${students.length}`);
    var count; 
    if(students)
    {
      count = students.length;
      var studentIds = [];
      console.log(`Found ${count} students`);
      if(count == 0)
      {
        return(null);
      }
      var i;
      for(i = 0; i < students.length; i++)
      {
        studentIds.push(students[i].studentId);
      }
      return studentIds;
    }
    else
    {
      return(null);
    }
    
  }
  catch(err)
  {
    console.log(` !!! Error in /models/courses.js  :  getAllStudentsInCourse()`);
    console.log(err);
    return(null);
  }  
}


exports.getStudentsInCourse = async (courseId, page) =>
{
  try
  {
    console.log(` == Getting List Of Students In Course ID:${courseId} `);
    const collection = getDBReference().collection('students');
    const tempCount = await collection.find({courseId: courseId}).sort({ _id: 1 }).toArray();
    console.log(` == Students: ${tempCount.length}`);
    var count; 
    if(tempCount)
    {
      count = tempCount.length;
      console.log(`Found ${count} students`);
      if(count == 0)
      {
        return({error: "404, No students found in this class"});
      }
    }
    else
    {
      return({error: "There was a problem getting the students in this course"});
    }
    
  
    const lastPage = Math.ceil(count / PAGE_SIZE);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const start = (page - 1) * PAGE_SIZE;
  
    const results = await collection.find({courseId: courseId})
      .sort({ _id: 1 })
      .skip(start)
      .limit(PAGE_SIZE)
      .toArray();

    if(results)
    {
      var students = [];
      var i;
      for(i = 0; i < results.length; i++)
      {
        students.push(results[i].studentId);
      }
    }
    else
    {
      return({error: "404, course not found"});
    }

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
      students: students,
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
    return({error: "There was a problem getting students"});
  }
 
}