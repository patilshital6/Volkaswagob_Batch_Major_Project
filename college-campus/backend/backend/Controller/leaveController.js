const Leave = require("../models/leave");
const Teacher = require("../models/teacher");

/* ================= APPLY FOR LEAVE ================= */
exports.applyLeave = async (req, res) => {
  try {
    const { empId, leaveType, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!empId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        error: "All fields are required: empId, leaveType, startDate, endDate, reason" 
      });
    }

    // Find teacher by empId
    const teacher = await Teacher.findOne({ empId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ error: "Start date cannot be in the past" });
    }

    if (end < start) {
      return res.status(400).json({ error: "End date cannot be before start date" });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      teacher: teacher._id,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        error: "You already have a leave application for overlapping dates" 
      });
    }

    // Create leave request
    const leave = await Leave.create({
      teacher: teacher._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate("teacher", "name empId email department");

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave: populatedLeave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL LEAVES (ADMIN) ================= */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, empId } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    let leaves;

    if (empId) {
      // Find teacher by empId
      const teacher = await Teacher.findOne({ empId });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      filter.teacher = teacher._id;
    }

    leaves = await Leave.find(filter)
      .populate("teacher", "name empId email department")
      .sort({ appliedDate: -1 });

    res.status(200).json({
      totalLeaves: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET LEAVES BY TEACHER EMP ID ================= */
exports.getLeavesByTeacher = async (req, res) => {
  try {
    const { empId } = req.params;

    // Find teacher by empId
    const teacher = await Teacher.findOne({ empId });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const leaves = await Leave.find({ teacher: teacher._id })
      .populate("teacher", "name empId email department")
      .sort({ appliedDate: -1 });

    res.status(200).json({
      empId,
      teacherName: teacher.name,
      totalLeaves: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET LEAVE BY ID ================= */
exports.getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate("teacher", "name empId email department");

    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE LEAVE STATUS (APPROVE/REJECT) ================= */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectionReason } = req.body;

    // Validate status
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be 'Approved' or 'Rejected'" 
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    // Check if already processed
    if (leave.status !== "Pending") {
      return res.status(400).json({ 
        error: `Leave is already ${leave.status.toLowerCase()}` 
      });
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = approvedBy || "Admin";
    leave.approvedDate = new Date();

    if (status === "Rejected" && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    const updatedLeave = await Leave.findById(id)
      .populate("teacher", "name empId email department");

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave: updatedLeave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE LEAVE ================= */
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ error: "Leave not found" });
    }

    // Only pending leaves can be deleted
    if (leave.status !== "Pending") {
      return res.status(400).json({ 
        error: `Cannot delete ${leave.status.toLowerCase()} leave` 
      });
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "Leave application deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET LEAVE STATISTICS ================= */
exports.getLeaveStats = async (req, res) => {
  try {
    const { empId } = req.params;

    let filter = {};
    if (empId) {
      const teacher = await Teacher.findOne({ empId });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      filter.teacher = teacher._id;
    }

    const totalLeaves = await Leave.countDocuments(filter);
    const pendingLeaves = await Leave.countDocuments({ ...filter, status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ ...filter, status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ ...filter, status: "Rejected" });

    // Calculate total approved days
    const approvedLeavesData = await Leave.find({ ...filter, status: "Approved" });
    const totalApprovedDays = approvedLeavesData.reduce((sum, leave) => sum + leave.totalDays, 0);

    res.status(200).json({
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalApprovedDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
