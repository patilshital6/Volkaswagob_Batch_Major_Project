const express = require("express");
const router = express.Router();

const {
  createStudent,
  createBulkStudents,
  getAllStudents,
  getStudentById,
  getStudentsByYear,
  deleteStudentById
} = require("../Controller/studentController");

router.post("/bulk", createBulkStudents);  // create bulk students
router.post("/", createStudent);           // create student
router.get("/", getAllStudents);        // get all students
router.get("/year/:year", getStudentsByYear);  // get students by year
router.get("/:rollNo", getStudentById);
router.delete("/:rollNo", deleteStudentById);  // delete student by roll no


module.exports = router;
