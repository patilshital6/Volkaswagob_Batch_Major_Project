const express = require("express");
const router = express.Router();

const {
  createTeacher,
  getAllTeachers
} = require("../Controller/teacherController");

router.post("/", createTeacher);    // create teacher
router.get("/", getAllTeachers);    // get all teachers

module.exports = router;
