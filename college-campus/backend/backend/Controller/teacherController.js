const Teacher = require("../models/teacher");
const bcrypt = require("bcryptjs");

/* ================= CREATE TEACHER ================= */
exports.createTeacher = async (req, res) => {
  try {
    const {
      empId,
      name,
      email,
      password,
      department,
      address
    } = req.body;

    // Validate required fields
    if (!empId || !name || !password || !department || !address) {
      return res.status(400).json({
        message: "empId, name, password, department, and address are required"
      });
    }
    // Check existing teacher by empId or email
    const existing = await Teacher.findOne({
      $or: [{ empId }, { email }]
    });

    if (existing) {
      return res.status(400).json({
        message: "Teacher already exists with same empId or email"
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      empId,
      name,
      email,
      password: hashedPassword,
      department,
      address
    });

    res.status(201).json({
      message: "Teacher created successfully",
      teacher
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL TEACHERS ================= */
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("courses")
      .populate("students", "rollNo name");

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

