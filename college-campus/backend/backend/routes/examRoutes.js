const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam
} = require("../Controller/examController");

router.post("/", createExam);              // create exam
router.get("/", getAllExams);              // get all exams
router.get("/:id", getExamById);           // get exam by id
router.put("/:id", updateExam);            // update exam
router.delete("/:id", deleteExam);         // delete exam

module.exports = router;
