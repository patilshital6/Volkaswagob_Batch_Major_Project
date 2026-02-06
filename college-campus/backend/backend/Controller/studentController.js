const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Course = require("../models/course");
const bcrypt = require("bcryptjs");
const generateRollNo = require("../utils/generateRollNo");

/* ================= CREATE STUDENT ================= */
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      currentYear
    } = req.body;

    // Check existing student by email
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ AUTO-GENERATE ROLL NO (22Y001 style)
    const rollNo = await generateRollNo(currentYear);

    const student = await Student.create({
      rollNo,
      name,
      email,
      password: hashedPassword,
      department,
      currentYear
    });

    res.status(201).json({
      message: "Student created successfully",
      rollNo,
      student
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= CREATE BULK STUDENTS ================= */
exports.createBulkStudents = async (req, res) => {
  try {
    const students = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Request body must be an array of students" });
    }

    if (students.length === 0) {
      return res.status(400).json({ error: "Students array cannot be empty" });
    }

    // Validate and prepare all students
    const preparedStudents = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      if (!student.name || !student.email || !student.password || !student.department || !student.currentYear) {
        return res.status(400).json({ 
          error: `Student at index ${i} is missing required fields: name, email, password, department, currentYear. Received: ${JSON.stringify(student)}` 
        });
      }

      // Validate currentYear is a number
      if (typeof student.currentYear !== 'number' || student.currentYear < 1 || student.currentYear > 4) {
        return res.status(400).json({ 
          error: `Student at index ${i}: currentYear must be a number between 1 and 4` 
        });
      }

      // Check if student already exists
      const existing = await Student.findOne({ email: student.email });
      if (existing) {
        return res.status(400).json({ error: `Student with email ${student.email} already exists` });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(student.password, 10);

      // Generate roll no
      const rollNo = await generateRollNo(student.currentYear);

      preparedStudents.push({
        rollNo,
        name: student.name,
        email: student.email,
        password: hashedPassword,
        department: student.department,
        currentYear: student.currentYear,
        age: student.age || null
      });
    }

    const createdStudents = await Student.insertMany(preparedStudents);

    res.status(201).json({
      message: `${createdStudents.length} students created successfully`,
      count: createdStudents.length,
      students: createdStudents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ================= GET ALL STUDENTS ================= */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("courses", "courseName courseCode credits");

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET STUDENT BY ROLL NO ================= */
exports.getStudentById = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({ rollNo })
      .populate("courses", "courseName courseCode credits department teacher");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET STUDENTS BY YEAR ================= */
exports.getStudentsByYear = async (req, res) => {
  try {
    const { year } = req.params;

    // Validate year is a number between 1 and 4
    if (!year || isNaN(year) || year < 1 || year > 4) {
      return res.status(400).json({ message: "Year must be a number between 1 and 4" });
    }

    const students = await Student.find({ currentYear: parseInt(year) })
      .populate("courses", "courseName courseCode credits department");

    if (students.length === 0) {
      return res.status(404).json({ message: `No students found in Year ${year}` });
    }

    res.json({
      year: parseInt(year),
      count: students.length,
      students: students
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE STUDENT BY ROLL NO ================= */
exports.deleteStudentById = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const { rollNo } = req.params;

    if (role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can delete students"
      });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const student = await Student.findOneAndDelete({ rollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student deleted successfully",
      deletedRollNo: rollNo
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
