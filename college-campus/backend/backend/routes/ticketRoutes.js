const express = require("express");
const router = express.Router();

const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  deleteTicket
} = require("../Controller/ticketController");

router.post("/", createTicket);           // create support ticket
router.get("/", getAllTickets);           // get all tickets
router.get("/:id", getTicketById);        // get ticket by id
router.put("/:id", updateTicketStatus);   // update ticket status
router.delete("/:id", deleteTicket);      // delete ticket

module.exports = router;
