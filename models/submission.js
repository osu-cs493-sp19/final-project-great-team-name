
/*
* Schema describing required/optional fields of a Course object.
*/
const SubmissionSchema = {
 assignmentId: { required: true },
 studentId: { required: true },
 timestamp: { required: false }, // This should be calculated
 file: { required: true }
};
exports.SubmissionSchema = SubmissionSchema;
