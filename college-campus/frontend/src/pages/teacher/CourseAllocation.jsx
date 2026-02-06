import React, { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";

const CourseAllocation = () => {
  const [form, setForm] = useState({
    courseCode: "",
    rollNo: "",
    section: "",
    semester: "",
    comments: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (form.courseCode.trim().length < 5) {
      setError("Course Code must be at least 5 characters.");
      return false;
    }
    if (form.rollNo.trim().length < 5) {
      setError("Roll No must be at least 5 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const bodyToSend = {
        courseCode: form.courseCode.trim(),
        rollNo: form.rollNo.trim(),
      };

      const res = await fetch(
        "/api/courses/enroll-student",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyToSend),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess("Student enrolled successfully!");
        setError("");
        setForm({
          courseCode: "",
          rollNo: "",
          section: "",
          semester: "",
          comments: "",
        });
      } else {
        setError(
          data.message || data.error || "Enrollment failed. Please try again."
        );
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    }
  };

  return (
    <div className="py-8">
      <PageHeader
        title="Course Allocation"
        subtitle="Enroll a student into a course."
      />

      <div className="max-w-xl mx-auto bg-white border rounded-3xl p-6 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Course Code</label>
          <input
            type="text"
            name="courseCode"
            value={form.courseCode}
            onChange={handleChange}
            placeholder="Enter course code (EX: CSE103)"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">Roll No</label>
          <input
            type="text"
            name="rollNo"
            value={form.rollNo}
            onChange={handleChange}
            placeholder="Enter roll no (22Y001)"
            className="w-full border p-2 rounded"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        {/* ONLY THIS BUTTON IS MODIFIED */}
        <button
          onClick={handleSubmit}
          className="
            w-full
            bg-slate-900
            text-white
            py-3
            rounded-xl
            font-semibold
            tracking-wide
            transition-all
            duration-300
            hover:bg-slate-800
            hover:shadow-lg
            active:scale-[0.98]
            focus:outline-none
            focus:ring-2
            focus:ring-slate-900
            focus:ring-offset-2
          "
        >
          Submit Allocation
        </button>
      </div>
    </div>
  );
};

export default CourseAllocation;
