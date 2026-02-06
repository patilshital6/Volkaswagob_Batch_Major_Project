const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  rollNo: {
      type: String,
      required: true,
      unique: true,      
      trim: true
    },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  age: Number,
  department: String,
  currentYear: Number,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  role: { type: String, default: "student" },
  totalCredits: {
  type: Number,
  default: 0
},
address: {
    type: String
  },
  password: {
  type: String,
  required: true
}
    
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
