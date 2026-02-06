const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  leaveType: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
