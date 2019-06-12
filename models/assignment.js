/* @assignment.js
 *
 * Assignment & submission models and related functions.
 *
 */

const { extractValidFields,validateAgainstSchemas} = require('../lib/validation');
//GRID fs for storing data,
const { getDBReference, _ID, grid_bucket  } = require ('../lib/mongoDB');
const multer = require('multer');
const CustomError = require("../lib/custom-error");

// below is the macro for the assigments key value
const HW = "assignments";
const TURNIN = "submissions"
const TURNIN_BLOBS ="sumbmissions-blobs";



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
 timestamp: { required: false }, // This should be calculated?
 file: { required: false }
};
exports.SubmissionSchema = SubmissionSchema;


/*
 * Creates a new assignment object in the DB & returns Id
input:
{
	"courseId": 56,
	"title": "52 card pickup",
	"points": "100",
	"due": "tomorrow"
}
output:
{
    "id": "5cf72986f31af424e2b7dea2"
}
 */
exports.insertAssignment = async (assignment) => {
try{
  const ass_i = extractValidFields(assignment,AssignmentSchema);
  const collection = getDBReference().collection(HW);
  const result = await collection.insertOne(ass_i);
  console.log(result);
  console.log(" == insertAssignment: assignment", assignment);
  return result.insertedId;
}
catch(e){
  console.log(e);
}
}


/*
 * Fetch details about an assignment by Id
input:
{
    "id": "5cf72986f31af424e2b7dea2"
}
output:
{
    "_id": "5cf72986f31af424e2b7dea2",
    "courseId": 56,
    "title": "52 card pickup",
    "points": "100",
    "due": "tomorrow"
}
 */
exports.getAssignmentDetailsById = async (id) => {
  console.log(" == getAssignmentDetailsById: id", id);
  const collection = getDBReference().collection(HW);
  var result = await collection.findOne({ _id: new _ID(id)});

  return result;
}


/*
 * Partial update of an Assignment by Id
before:
{
    "_id": "5cf72986f31af424e2b7dea2",
    "courseId": 56,
    "title": "52 card pickup",
    "points": "100",
    "due": "tomorrow"
}
input:
{
	"due": "not tomorrow"
}
output:
{
    "lastErrorObject": {
        "n": 1,
        "updatedExisting": true
    },
    "value": {
        "_id": "5cf72986f31af424e2b7dea2",
        "courseId": 56,
        "title": "52 card pickup",
        "points": "100",
        "due": "not tomorrow"
    },
    "ok": 1
}
after:
{
    "_id": "5cf72986f31af424e2b7dea2",
    "courseId": 56,
    "title": "52 card pickup",
    "points": "100",
    "due": "not tomorrow"
}
 */
async function patchAssignment (id, patch) {
  console.log(" == updateAssignment: id,assignment", id,assignment);
try{
  const collection = getDBReference().collection(HW);
  var assignment = await collection.findOne({ _id: new _ID(id)});
  var result=  await collection.findOneAndUpdate(
    { _id: new _ID(id)},
    {$set: patch},
    {returnNewDocument:true},
  );
  console.log("==Updated Assignment: ",result);
  return result;
}catch(e){
  console.log(e);
}
}
exports.updateAssignment = patchAssignment

/*
 * Delete an Assignment by Id
 before:
 {
    "_id": "5cf73070e5f9792b1299bace",
    "courseId": 56,
    "title": "52 card pickup said no one ever",
    "points": "100",
    "due": "soon"
}
input:
{
   "id": "5cf73070e5f9792b1299bace"
 }
 output:
{} 204 noContent
after:
GET
 */
exports.deleteAssignment = async (id) => {
  const collection = getDBReference().collection(HW);
  var result;
  try{
    // var assignment = await collection.findOne({ _id: new _ID(id)});
    result = await collection.remove(
      { _id: new _ID(id) },
      { justOne: true},
    );
    console.log(` == deleteAssignment: id:${id} result: ${result.result} `);
  }
  catch(e){
    console.log(e);
  }
  if(result.result.n>0){
    return result.result;
  }
  else{
    throw new CustomError("no record on file", 404);
  }
}


/*
 * Fetch paginated list of submissions by Assignment Id
 input:
 -------Page 1 ---
/assignments/5cf72986f31af424e2b7dea2/submissions
{
  assignemntid: 5cf72986f31af424e2b7dea2
  page: n/a
}
 output:
 [
    {
        "_id": "5cf73591f81a412f8687e449",
        .
        .
        "timestamp": "Tue Jun 04 2019 20:22:57 GMT-0700 (Pacific Daylight Time)"
    },
    {
        "_id": "5cf7359af81a412f8687e44a",
        .
        .
        "timestamp": "Tue Jun 04 2019 20:23:06 GMT-0700 (Pacific Daylight Time)"
    },
input:
-------Page 2---
/assignments/5cf72986f31af424e2b7dea2/submissions?page=2
{
  assignemntid: 5cf72986f31af424e2b7dea2
  page: 2
}
output:
[
    {
        "_id": "5cf7359df81a412f8687e44f",
        .
        .
        "timestamp": "Tue Jun 04 2019 20:23:09 GMT-0700 (Pacific Daylight Time)"
    },
    {
        "_id": "5cf7359df81a412f8687e450",
        .
        .
        "timestamp": "Tue Jun 04 2019 20:23:09 GMT-0700 (Pacific Daylight Time)"
    },

This fetches meta data about a submisttion
 */
exports.getAssignmentSubmissions = async (id, studentId, page) => {
  const PAGE_SIZE = 3;
  const collection = getDBReference().collection(TURNIN);
  var query;
  var results;

  if(studentId){
    query = { $and: [ {studentId: studentId}, {assignmentId: id } ] };
  }
  else{
    query = {assignmentId: id};
  }

  if(page==1 || !page){
     results = await collection.find(query).limit(PAGE_SIZE).toArray();
  }
  else{
     results =  await collection.find(query).skip(page*PAGE_SIZE).limit(PAGE_SIZE).toArray();
   }
  console.log(" == getAssignmentSubmissions: id,studentId,page", id,studentId,page);
  console.log("Page: ", results);
  // console.log(results);
  return results
}


/*
 * Insert a new submission for an Assignment
Requirements for API
ARGUMENTS

for file.propTypes.string.isRequired option
  one function parameter: submission
    submission = {
     ...SubmissionSchema
  }
for the multer stragety
      one Function paramter: req
      req = {
        body,
        params,
        file
      }
      {params, body, file}

UNIT TESTING
input:
{
	"assignmentId": "5cf72986f31af424e2b7dea2" ,
	"file": "i wrote this at 2am hahah"
}
output:
{
    "id": "5cf735a5f81a412f8687e458"
}
*/
exports.insertSubmission = async (submission) => {
  console.log(" == insertSubmission: id, submission");
  var result;
  try{
      const sub_i = extractValidFields(submission,SubmissionSchema);
      sub_i.timestamp = new Date().toString();
      const collection = getDBReference().collection(TURNIN);
      result = await collection.insertOne(sub_i);
      return result;
  }
  catch(e){
    console.log(e);
  }
}
/*
UNIT TESTING
input:
GET localhost:8000/assignments/blobs/5d00aa907931994f19f9c44c


output:
raw file
*/
exports.getGridFileStreamById = async (grid_doc_id) =>{
  console.log("=== About to serve RAW: \nID: ", grid_doc_id);
  var bucket = new grid_bucket(getDBReference(), {bucketName:TURNIN_BLOBS });
  var result = await bucket.find({ _id: new _ID(grid_doc_id) } ).toArray();
  console.log("results: ", result.length);
  result = await bucket.openDownloadStream(new _ID(grid_doc_id));
  return result;
}

  // var bucket = new gridFSBucket(getDBReference(),{bucketName: TURNIN_BLOBS})
  // const metadata = {
  //   contentType: 'application/pdf'
  //   student: body.studentId,
  //   assignemnt: body.assignmentId,
  // };
  //
  // var uploadstream = bucket.openUploadStream(
  //   file.filename,
  //  { metadata: metadata });
