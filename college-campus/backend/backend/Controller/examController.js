const Exam = require("../models/exams");
const Course = require("../models/course");

/* ================= CREATE EXAM ================= */
exports.createExam = async (req, res) => {
  try {
    const { courseCode, ...examData } = req.body;

    // Validate courseCode is provided
    if (!courseCode) {
      return res.status(400).json({ error: "courseCode is required" });
    }

    // Find course by courseCode
    const courseFound = await Course.findOne({ courseCode });
    if (!courseFound) {
      return res.status(404).json({ 
        error: `Course not found with courseCode: ${courseCode}. Please create the course first.` 
      });
    }

    // Create exam with course reference
    const exam = await Exam.create({
      ...examData,
      courseCode,
      course: courseFound._id
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET ALL EXAMS ================= */
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("course");
    res.json(exams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET EXAM BY ID ================= */
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("course");
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= UPDATE EXAM ================= */
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("course");
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= DELETE EXAM ================= */
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
