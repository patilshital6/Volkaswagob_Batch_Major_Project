const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rollNo:{
    type:String
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ticket", ticketSchema);
