const express = require("express");
const router = express.Router();

const {
  createAssignment,
  submitAssignment,
  getAllAssignmentsWithSubmissions,
  getAssignmentsByStudentRollNo,
  getAssignmentById,
  getSubmissionsByTeacherEmpId,
  gradeSubmission
} = require("../Controller/assignmentController");

router.post("/", createAssignment);                       // create assignment
router.post("/submit", submitAssignment);                 // submit assignment
router.get("/submissions", getAllAssignmentsWithSubmissions); // get all with submissions
router.get("/teacher/:empId/submissions", getSubmissionsByTeacherEmpId); // get submissions for teacher
router.get("/student/:id", getAssignmentsByStudentRollNo); // get assignments for student
router.get("/:id", getAssignmentById);                    // get single assignment by ID
router.put("/:assignmentId/submissions/:submissionId/grade", gradeSubmission); // grade submission

module.exports = router;
