const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Absent"] }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
