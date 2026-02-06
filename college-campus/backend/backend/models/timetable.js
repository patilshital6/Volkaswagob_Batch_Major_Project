const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  courseCode: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: String,
  section: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Timetable", timetableSchema);
