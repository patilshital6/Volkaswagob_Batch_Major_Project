const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  courseName: String,
  courseCode: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  startTime: String,
  endTime: String,
  venue: String,
  examDate: String
});

module.exports = mongoose.model("Exam", examSchema);
