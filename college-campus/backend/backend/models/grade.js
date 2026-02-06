    const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  marksObtained: Number,
  grade: String
});

module.exports = mongoose.model("Grade", gradeSchema);
