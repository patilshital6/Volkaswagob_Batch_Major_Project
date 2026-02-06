const Counter = require("../models/counter");

const generateRollNo = async (currentYear) => {
  const currentFullYear = new Date().getFullYear(); // 2026
  const admissionYear = currentFullYear - currentYear; // 2022

  const yearPrefix = String(admissionYear).slice(-2); // "22"
  const prefix = `${yearPrefix}Y`; // "22Y"

  const counter = await Counter.findOneAndUpdate(
    { prefix },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.value).padStart(3, "0");

  return `${prefix}${serial}`; // 22Y001
};

module.exports = generateRollNo;
