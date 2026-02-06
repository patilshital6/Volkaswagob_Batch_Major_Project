const express = require("express");
const router = express.Router();

const {
  createTimetable,
  getAllTimetables,
  getCourseTimetable,
  getTimetableByDay,
  getTeacherTimetable,
  updateTimetable,
  deleteTimetable
} = require("../Controller/timetableContoller");

router.post("/", createTimetable);                    // create timetable
router.get("/", getAllTimetables);                    // get all timetables
router.get("/course/:courseCode", getCourseTimetable);// get by course code
router.get("/day/:day", getTimetableByDay);           // get by day
router.get("/teacher/:empId", getTeacherTimetable);   // get by teacher
router.put("/:id", updateTimetable);                  // update timetable
router.delete("/:id", deleteTimetable);               // delete timetable

module.exports = router;
