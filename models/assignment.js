

/*
* Schema describing required/optional fields of a Course object.
*/
const AssignmentSchema = {
 courseId: { required: true },
 title: { required: true },
 points: { required: true },
 due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;
