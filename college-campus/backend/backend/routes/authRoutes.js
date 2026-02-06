const express = require("express");
const router = express.Router();

const { registerStudent, loginStudent,loginTeacher } = require("../Controller/authController");

router.post("/register", registerStudent);  // register student
router.post("/login", loginStudent);        // login student/teacher
router.post("/login/teacher", loginTeacher);

module.exports = router;