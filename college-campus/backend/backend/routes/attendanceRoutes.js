const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getStudentAttendance
} = require("../Controller/attendanceController");

router.post("/", markAttendance);                         // mark attendance
router.get("/student/:studentId", getStudentAttendance); // student attendance

module.exports = router;
