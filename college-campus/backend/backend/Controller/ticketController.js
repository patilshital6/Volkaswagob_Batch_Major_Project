const Ticket = require("../models/ticket");

/* ================= CREATE TICKET ================= */
exports.createTicket = async (req, res) => {
  try {
    const { issue, description } = req.body;

    if (!issue || !description) {
      return res.status(400).json({ error: "Issue and description are required" });
    }

    const ticket = await Ticket.create({
      issue,
      description
    });

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET ALL TICKETS ================= */
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET TICKET BY ID ================= */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= UPDATE TICKET STATUS ================= */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be Open, In Progress, Resolved, or Closed" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= DELETE TICKET ================= */
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
