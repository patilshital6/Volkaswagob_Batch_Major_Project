const Timetable = require("../models/timetable");
const Course = require("../models/course");
const Teacher = require("../models/teacher");

/* ================= CREATE TIMETABLE ================= */
exports.createTimetable = async (req, res) => {
  try {
    const { courseCode, empId, ...timetableData } = req.body;

    // Find course by courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find teacher by empId (if provided)
    let teacher = null;
    if (empId) {
      teacher = await Teacher.findOne({ empId });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
    }

    // Create timetable entry
    const timetable = await Timetable.create({
      ...timetableData,
      courseCode,
      course: course._id,
      teacher: teacher ? teacher._id : null
    });

    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET ALL TIMETABLES ================= */
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("course")
      .populate("teacher")
      .sort({ day: 1, startTime: 1 });
    res.json(timetables);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET TIMETABLE BY COURSE ================= */
exports.getCourseTimetable = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const timetables = await Timetable.find({ courseCode })
      .populate("course", "courseName courseCode students")
      .populate("teacher", "empId name")
      .sort({ day: 1, startTime: 1 });  
    
    if (timetables.length === 0) {
      return res.status(404).json({ error: "No timetable found for this course" });
    }
    res.json(timetables);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET TIMETABLE BY DAY ================= */
exports.getTimetableByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    if (!validDays.includes(day)) {
      return res.status(400).json({ error: "Invalid day. Must be Monday-Saturday" });
    }

    const timetables = await Timetable.find({ day })
      .populate("course", "courseName courseCode students")
      .populate("teacher", "empId name")
      .sort({ startTime: 1 });
    
    res.json(timetables);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET TIMETABLE BY TEACHER ================= */
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { empId } = req.params;
    
    const teacher = await Teacher.findOne({ empId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const timetables = await Timetable.find({ teacher: teacher._id })
      .populate("course")
      .populate("teacher")
      .sort({ day: 1, startTime: 1 });
    
    res.json(timetables);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= UPDATE TIMETABLE ================= */
exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("course").populate("teacher");
    
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }
    res.json(timetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= DELETE TIMETABLE ================= */
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }
    res.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
