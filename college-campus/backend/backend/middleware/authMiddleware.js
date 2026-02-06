const bcrypt = require("bcryptjs");
const Student = require("../models/student");
const Teacher = require("../models/teacher");

const authMiddleware = async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const Model = role === "student" ? Student : Teacher;

  const user = await Model.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  req.user = user;       // full DB object
  req.userRole = role;  // student / teacher

  next();
};

module.exports = authMiddleware;
