const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  empId: {
      type: String,
      required: true,
      unique: true,        
      trim: true
    },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  department:{
    type:String,
    required:true
  },
  address: {
      type: String, 
      required: true
    },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  role: { type: String, default: "teacher" },
  password: {
  type: String,
  required: true
}

}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
