import React, { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../context/AuthContext";

const Support = () => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // Get rollNo from context
  const rollNo = user?.rollNo;

  const issueOptions = [
    "LMS not working",
    "Cleaning & hygiene issue",
    "Electrical issue",
    "Projector / microphone issue",
    "Furniture / chair issue",
    "Profile-related issue",
    "Assignment submission issue",
    "Course enrollment issue",
    "Exam / timetable issue",
    "Payment / fee issue",
  ];

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!ticket.title || !ticket.description) {
      alert("Please select an issue and describe it");
      return;
    }

    if (!rollNo) {
      alert("User not identified. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/tickets/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            issue: ticket.title,
            description: ticket.description,
            rollNo, // ✅ added here
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to raise ticket");
      }

      alert("Ticket raised successfully!");

      // reset form
      setTicket({
        title: "",
        description: "",
      });
    } catch (error) {
      console.error("Error:", error.message);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <PageHeader
        title="Ticketing Support"
        subtitle="Report an issue or request assistance"
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">

        {/* Issue Type */}
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Issue Type
        </label>
        <select
          name="title"
          value={ticket.title}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">Select an issue</option>
          {issueOptions.map((issue, index) => (
            <option key={index} value={issue}>
              {issue}
            </option>
          ))}
        </select>

        {/* Description */}
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={ticket.description}
          onChange={handleChange}
          rows="5"
          placeholder="Describe the issue in detail..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition
              ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {loading ? "Submitting..." : "Raise Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
