const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ================= CORS CONFIG ================= */
app.use(cors({
  origin: [
    "https://campus-portal-zeta.vercel.app", // production frontend
    "http://localhost:3000"                 // local frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 Handle preflight requests (IMPORTANT)
app.use(cors());

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= ROUTES ================= */

// AUTH ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// CORE MODULE ROUTES
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
