const Assignment = require("../models/assignment");
const Course = require("../models/course");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
/* ================= CREATE ASSIGNMENT ================= */
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseCode, teacherEmpId } = req.body;

    // find course using courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // find teacher using empId
    const teacher = await Teacher.findOne({ empId: teacherEmpId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      course: course._id,
      teacher: teacher._id
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET ALL ASSIGNMENTS FOR STUDENT (WITH FULL DATA) ================= */
exports.getAssignmentsByStudentRollNo = async (req, res) => {
  try {
    const rollNo = req.params.id;

    // 1️⃣ Find student by rollNo
    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2️⃣ If student has no courses
    if (!student.courses || student.courses.length === 0) {
      return res.status(200).json({
        rollNo,
        totalAssignments: 0,
        assignments: []
      });
    }

    // 3️⃣ Find assignments for student's courses with full course data
    const assignments = await Assignment.find({
      course: { $in: student.courses }
    })
      .populate("course", "courseName courseCode") // Include course details
      .populate("teacher", "name")
      .populate("submissions.student", "name rollNo");

    // 4️⃣ Shape response to match frontend expectations
    const formattedAssignments = assignments.map(a => ({
      _id: a._id,
      id: a._id.toString(),
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      course: {
        _id: a.course._id,
        courseName: a.course.courseName,
        courseCode: a.course.courseCode,
        name: a.course.courseName,
        code: a.course.courseCode
      },
      teacher: {
        _id: a.teacher._id,
        name: a.teacher.name
      },
      submissions: a.submissions.map(sub => ({
        _id: sub._id,
        student: sub.student,
        submittedAt: sub.submittedAt,
        fileUrl: sub.fileUrl,
        file: sub.fileUrl,
        fileName: sub.fileUrl,
        marks: sub.marks ?? null,
        feedback: sub.feedback || "",
        gradedAt: sub.gradedAt || null,
        gradedBy: sub.gradedBy || null
      })),
      submissionFiles: a.submissions.map(s => s.fileUrl).filter(Boolean)
    }));

    res.status(200).json({
      rollNo,
      totalAssignments: formattedAssignments.length,
      assignments: formattedAssignments
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ================= SUBMIT ASSIGNMENT (USING COURSE CODE) ================= */
exports.submitAssignment = async (req, res) => {
  try {
    const { courseCode, rollNo, fileUrl } = req.body;

    console.log("📝 Submit Assignment Request:", { courseCode, rollNo, fileUrl });

    // Validate required fields
    if (!courseCode || !rollNo || !fileUrl) {
      console.error("❌ Validation Error: Missing fields");
      return res.status(400).json({ 
        error: "Missing required fields: courseCode, rollNo, and fileUrl are required" 
      });
    }

    // Find course by courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) {
      console.error(`❌ Course Error: Course with code ${courseCode} not found`);
      return res.status(404).json({ error: `Course with code ${courseCode} not found` });
    }

    console.log("✅ Course found:", course._id);

    // If assignmentId is provided, use it directly; otherwise fall back to finding by course
let assignment;
if (req.body.assignmentId) {
  assignment = await Assignment.findById(req.body.assignmentId);
} else {
  assignment = await Assignment.findOne({ course: course._id })
    .sort({ createdAt: -1 })
    .limit(1);
}

if (!assignment) {
  console.error(`❌ Assignment Error: No assignment found`);
  return res.status(404).json({ error: `Assignment not found` });
}

    console.log("✅ Assignment found:", assignment._id);

    // Find student by rollNo
    const student = await Student.findOne({ rollNo });
    if (!student) {
      console.error(`❌ Student Error: Student with roll number ${rollNo} not found`);
      return res.status(404).json({ error: `Student with roll number ${rollNo} not found` });
    }

    console.log("✅ Student found:", student._id);

    // Check if student is registered in the course
    if (!course.students || !course.students.includes(student._id)) {
      console.error(`❌ Enrollment Error: Student ${rollNo} not registered for course ${courseCode}`);
      return res.status(403).json({ error: `Student is not registered for course ${courseCode}` });
    }

    console.log("✅ Student is enrolled in course");

    // Check if student already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === student._id.toString()
    );

    if (existingSubmissionIndex !== -1) {
      console.log("📝 Updating existing submission...");
      // Update existing submission
      assignment.submissions[existingSubmissionIndex] = {
        student: student._id,
        submittedAt: new Date(),
        fileUrl
      };
    } else {
      console.log("📝 Adding new submission...");
      // Add new submission
      assignment.submissions.push({
        student: student._id,
        submittedAt: new Date(),
        fileUrl
      });
    }

    await assignment.save();

    console.log("✅ Assignment saved successfully");

    // 🔧 RELOAD the assignment to get fresh data with populated submissions
    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate("course", "courseName courseCode")
      .populate("teacher", "name")
      .populate("submissions.student", "name rollNo");

    console.log("✅ Updated assignment submissions:", updatedAssignment.submissions.length);

    res.status(200).json({ 
      message: "Assignment submitted successfully",
      success: true,
      submission: {
        assignmentId: updatedAssignment._id,
        assignmentTitle: updatedAssignment.title,
        courseCode,
        rollNo,
        fileUrl,
        submittedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error("❌ Submit Assignment Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


/* ================= GET ASSIGNMENT BY ID WITH FULL DATA ================= */
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("course", "courseName courseCode")
      .populate("teacher", "name empId")
      .populate("submissions.student", "name rollNo");

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const formattedAssignment = {
      _id: assignment._id,
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      course: {
        _id: assignment.course._id,
        courseName: assignment.course.courseName,
        courseCode: assignment.course.courseCode,
        name: assignment.course.courseName,
        code: assignment.course.courseCode
      },
      teacher: {
        _id: assignment.teacher._id,
        name: assignment.teacher.name
      },
      submissions: assignment.submissions.map(sub => ({
        _id: sub._id,
        student: sub.student,
        submittedAt: sub.submittedAt,
        fileUrl: sub.fileUrl,
        file: sub.fileUrl,
        fileName: sub.fileUrl,
        marks: sub.marks ?? null,
        feedback: sub.feedback || "",
        gradedAt: sub.gradedAt || null,
        gradedBy: sub.gradedBy || null
      })),
      submissionFiles: assignment.submissions.map(s => s.fileUrl).filter(Boolean)
    };

    res.status(200).json(formattedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ASSIGNMENTS WITH SUBMISSIONS ================= */
exports.getAllAssignmentsWithSubmissions = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("submissions.student", "rollNo");

    // Format response to only include required fields
    const formattedData = [];
    
    assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        formattedData.push({
          assignmentId: assignment._id,
          assignmentName: assignment.title,
          submissionId: submission._id,
          studentRollNo: submission.student?.rollNo,
          fileUrl: submission.fileUrl,
          submittedAt: submission.submittedAt,
          marks: submission.marks ?? null,
          feedback: submission.feedback || "",
          gradedAt: submission.gradedAt || null
        });
      });
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL SUBMISSIONS FOR A TEACHER ================= */
exports.getSubmissionsByTeacherEmpId = async (req, res) => {
  try {
    const { empId } = req.params;

    const teacher = await Teacher.findOne({ empId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const assignments = await Assignment.find({ teacher: teacher._id })
      .populate("course", "courseName courseCode")
      .populate("submissions.student", "name rollNo");

    const submissions = [];
    assignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        submissions.push({
          submissionId: submission._id,
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          course: assignment.course ? {
            _id: assignment.course._id,
            courseName: assignment.course.courseName,
            courseCode: assignment.course.courseCode
          } : null,
          student: submission.student,
          studentName: submission.student?.name || "",
          studentRollNo: submission.student?.rollNo || "",
          submittedAt: submission.submittedAt,
          fileUrl: submission.fileUrl,
          marks: submission.marks ?? null,
          feedback: submission.feedback || "",
          gradedAt: submission.gradedAt || null
        });
      });
    });

    res.status(200).json({
      teacherEmpId: empId,
      totalSubmissions: submissions.length,
      submissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GRADE A SUBMISSION ================= */
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { marks, feedback, teacherEmpId } = req.body;

    if (!teacherEmpId) {
      return res.status(400).json({ error: "Teacher employee ID is required" });
    }

    const teacher = await Teacher.findOne({ empId: teacherEmpId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, teacher: teacher._id })
      .populate("course", "courseName courseCode")
      .populate("submissions.student", "name rollNo");

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    let parsedMarks = null;
    if (marks !== undefined && marks !== null && String(marks).trim() !== "") {
      parsedMarks = Number(marks);
      if (Number.isNaN(parsedMarks)) {
        return res.status(400).json({ error: "Marks must be a valid number" });
      }
    }

    submission.marks = parsedMarks;
    submission.feedback = feedback || "";
    submission.gradedAt = new Date();
    submission.gradedBy = teacher._id;

    await assignment.save();

    res.status(200).json({
      message: "Submission graded successfully",
      submission: {
        submissionId: submission._id,
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        course: assignment.course ? {
          _id: assignment.course._id,
          courseName: assignment.course.courseName,
          courseCode: assignment.course.courseCode
        } : null,
        student: submission.student,
        submittedAt: submission.submittedAt,
        fileUrl: submission.fileUrl,
        marks: submission.marks ?? null,
        feedback: submission.feedback || "",
        gradedAt: submission.gradedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
