import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ApplyLeaveForm = ({ onSuccess, onClose }) => {
  const { user } = useAuth();

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!leaveType || !startDate || !endDate || !reason) {
    alert("Please fill all fields");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/leaves/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // IMPORTANT if auth uses cookies
      body: JSON.stringify({
        empId: user.empId,
        leaveType,
        startDate,
        endDate,
        reason,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend error:", data);
      throw new Error(data.message || "Failed to apply leave");
    }

    onSuccess();   // refresh list
    onClose();     // close modal
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Apply Leave
      </h2>

      <div className="space-y-4">
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">Select Leave Type</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="w-full border rounded-lg p-2"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Submitting..." : "Apply Leave"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ApplyLeaveForm;
