
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
