const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getAllLeaves,
  getLeavesByTeacher,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
  getLeaveStats
} = require("../Controller/leaveController");

// Apply for leave
router.post("/apply", applyLeave);

// Get all leaves (with optional filters: ?status=Pending&leaveType=Sick Leave&empId=T001)
router.get("/", getAllLeaves);

// Get leave statistics (all or by teacher)
router.get("/stats", getLeaveStats);
router.get("/stats/:empId", getLeaveStats);

// Get leaves by teacher empId
router.get("/teacher/:empId", getLeavesByTeacher);

// Get single leave by ID
router.get("/:id", getLeaveById);

// Update leave status (approve/reject)
router.put("/:id/status", updateLeaveStatus);

// Delete leave (only pending)
router.delete("/:id", deleteLeave);

module.exports = router;
