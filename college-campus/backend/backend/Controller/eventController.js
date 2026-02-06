const Event = require("../models/event");

/* ================= CREATE EVENT ================= */
exports.createEvent = async (req, res) => {
  try {
    const { title, category, date, time, venue } = req.body;

    if (!title || !category || !date || !time || !venue) {
      return res.status(400).json({ error: "All fields (title, category, date, time, venue) are required" });
    }

    const event = await Event.create({
      title,
      category,
      date,
      time,
      venue
    });

    res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
/* ================= GET ALL EVENTS ================= */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET EVENT BY ID ================= */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= GET EVENTS BY CATEGORY ================= */
exports.getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const events = await Event.find({ category }).sort({ date: -1 });
    
    if (events.length === 0) {
      return res.status(404).json({ error: "No events found for this category" });
    }
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= UPDATE EVENT ================= */
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================= DELETE EVENT ================= */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
