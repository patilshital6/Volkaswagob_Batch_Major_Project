const Attendance = require("../models/attendance");

/* ================= MARK ATTENDANCE ================= */
exports.markAttendance = async (req, res) => {
  const { student, course, status } = req.body;

  const attendance = await Attendance.create({
    student,
    course,
    status
  });

  res.status(201).json(attendance);
};

/* ================= GET STUDENT ATTENDANCE ================= */
exports.getStudentAttendance = async (req, res) => {
  const attendance = await Attendance.find({ student: req.params.studentId })
    .populate("course", "courseName");

  res.json(attendance);
};
