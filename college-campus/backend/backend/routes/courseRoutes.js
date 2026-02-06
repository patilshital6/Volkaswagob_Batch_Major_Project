const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  assignTeacher,
  enrollStudent,
  enrollStudentsByYear,
  getCoursesByStudent

} = require("../Controller/courseController");

router.post("/", createCourse);                 // create course
router.get("/", getAllCourses);                 // get all courses
router.get("/:id", getCoursesByStudent);
router.post("/assign-teacher", assignTeacher);  // assign teacher to course
router.post("/enroll-student", enrollStudent);  // enroll student
router.post("/enroll-by-year", enrollStudentsByYear); // enroll students by year
module.exports = router;
