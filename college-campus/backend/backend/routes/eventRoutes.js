const express = require("express");
const router = express.Router();

const {
  createEvent,
  createBulkEvents,
  getAllEvents,
  getEventById,
  getEventsByCategory,
  updateEvent,
  deleteEvent
} = require("../Controller/eventController");

router.post("/", createEvent);                      // create event
router.get("/", getAllEvents);                      // get all events
router.get("/:id", getEventById);                   // get event by id
router.get("/category/:category", getEventsByCategory); // get events by category
router.put("/:id", updateEvent);                    // update event
router.delete("/:id", deleteEvent);                 // delete event

module.exports = router;
