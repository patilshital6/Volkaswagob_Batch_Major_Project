const Course = require("../models/course");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

/* ================= CREATE COURSE ================= */
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET ALL COURSES ================= */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "empId name department");
    res.json(courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= ASSIGN TEACHER ================= */
exports.assignTeacher = async (req, res) => {
  try {
    const { courseCode, empId } = req.body;

    // Validate empId and courseCode are provided
    if (!empId || !courseCode) {
      return res.status(400).json({ message: "empId and courseCode are required" });
    }

    // Validate teacher exists by empId
    const teacher = await Teacher.findOne({ empId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update course using courseCode
    const course = await Course.findOneAndUpdate(
      { courseCode },
      { teacher: teacher._id },
      { new: true }
    ).populate("teacher", "empId name department");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add course to teacher's courses
    await Teacher.findByIdAndUpdate(teacher._id, {
      $addToSet: { courses: course._id }
    });

    res.json({ message: "Teacher assigned successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= ENROLL STUDENT ================= */
exports.enrollStudent = async (req, res) => {
  try {
    const { courseCode, rollNo } = req.body;

    // Validate courseCode and rollNo are provided
    if (!courseCode || !rollNo) {
      return res.status(400).json({ message: "courseCode and rollNo are required" });
    }

    // Validate student exists by rollNo
    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get course details
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student's year matches course's year
   // ✅ FIX 1: Year comparison (number-safe)
if (Number(student.currentYear) !== Number(course.year)) {
  return res.status(400).json({ 
    message: `Year mismatch! Student is in Year ${student.currentYear} but this course is for Year ${course.year} students only`
  });
}

// ✅ FIX 2: Safe ObjectId comparison
const alreadyEnrolled = course.students.some(
  s => s.toString() === student._id.toString()
);

if (alreadyEnrolled) {
  return res.status(400).json({ message: "Student is already enrolled in this course" });
}


    // Check if student already enrolled
    if (course.students.includes(student._id)) {
      return res.status(400).json({ message: "Student is already enrolled in this course" });
    }

    // Update course using courseCode
    const updatedCourse = await Course.findOneAndUpdate(
      { courseCode },
      { $addToSet: { students: student._id } },
      { new: true }
    );

    // Add course to student.courses
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $addToSet: { courses: updatedCourse._id } },
      { new: true }
    ).populate("courses");

    res.json({ message: "Student enrolled successfully", student: updatedStudent });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCoursesByStudent = async (req, res) => {
  try {
    const { id } = req.params; // rollNo

    const student = await Student.findOne({ rollNo: id })
      .populate("courses", "courseName courseCode credits department");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      rollNo: student.rollNo,
      name: student.name,
      totalCourses: student.courses.length,
      courses: student.courses
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= ENROLL ALL STUDENTS OF A YEAR ================= */
exports.enrollStudentsByYear = async (req, res) => {
  try {
    const { courseCode, year } = req.body;

    // Validate courseCode and year are provided
    if (!courseCode || !year) {
      return res.status(400).json({ message: "courseCode and year are required" });
    }

    // Validate year is a number between 1 and 4
    if (isNaN(year) || year < 1 || year > 4) {
      return res.status(400).json({ message: "Year must be a number between 1 and 4" });
    }

    // Get course details
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course year matches requested year
    if (course.year !== parseInt(year)) {
      return res.status(400).json({ 
        message: `Year mismatch! This course is for Year ${course.year} students, but you're trying to enroll Year ${year} students` 
      });
    }

    // Get all students of the specified year
    const students = await Student.find({ currentYear: parseInt(year) });

    if (students.length === 0) {
      return res.status(404).json({ message: `No students found in Year ${year}` });
    }

    // Enroll each student
    let enrolledCount = 0;
    let skippedCount = 0;

    for (let student of students) {
      // Check if student already enrolled
      if (!course.students.includes(student._id)) {
        // Add student to course
        await Course.findByIdAndUpdate(course._id, {
          $addToSet: { students: student._id }
        });

        // Add course to student
        await Student.findByIdAndUpdate(student._id, {
          $addToSet: { courses: course._id }
        });

        enrolledCount++;
      } else {
        skippedCount++;
      }
    }

    const updatedCourse = await Course.findById(course._id)
      .populate("teacher", "empId name department");

    res.json({
      message: `Enrollment completed for Year ${year}`,
      courseCode: courseCode,
      year: parseInt(year),
      totalStudents: students.length,
      enrolled: enrolledCount,
      skipped: skippedCount,
      course: updatedCourse
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
