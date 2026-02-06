const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: String,
  courseCode: String,
  department: String,
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
});

module.exports = mongoose.model("Course", courseSchema);
