/*
* Schema describing required/optional fields of a Assignment object.
*/
const AssignmentSchema = {
 courseId: { required: true },
 title: { required: true },
 points: { required: true },
 due: { required: true },

};
exports.AssignmentSchema = AssignmentSchema;


/*
* Schema describing required/optional fields of a Submission object.
*/
const SubmissionSchema = {
 assignmentId: { required: true },
 studentId: { required: true },
 timestamp: { required: false }, // This should be calculated?
 file: { required: true }
};
exports.SubmissionSchema = SubmissionSchema;
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
* Schema describing required/optional fields of a User object.
*/
const UserSchema = {
 name: { required: true },
 email: { required: true },
 password: { required: true },
 role: { required: true }
};
exports.UserSchema = UserSchema;


/*
* Schema describing required fields for User object for authorization.
*/
const AuthSchema = {
 email: { required: true },
 password: { required: true }
};
exports.AuthSchema = AuthSchema;
