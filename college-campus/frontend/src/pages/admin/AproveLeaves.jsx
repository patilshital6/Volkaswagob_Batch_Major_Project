import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";

const ApproveLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectedReason, setRejectedReason] = useState("");

  // Fetch all leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaves");
      const data = await res.json();
      setLeaves(data.leaves || data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Approve leave (✔ REQUIRED empId)
  const approveLeave = async (leave) => {
    await fetch(`/api/leaves/${leave._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Approved",
        empId: leave.teacher.empId,
      }),
    });

    fetchLeaves();
  };

  // Reject leave (✔ REQUIRED empId + rejectedReason)
  const confirmReject = async () => {
    if (!rejectedReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    await fetch(`/api/leaves/${selectedLeave._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Rejected",
        rejectedReason,
        empId: selectedLeave.teacher.empId,
      }),
    });

    setShowRejectModal(false);
    setRejectedReason("");
    setSelectedLeave(null);
    fetchLeaves();
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <PageHeader
        title="Leave Requests"
        subtitle="Approve or reject teacher leave applications"
      />

      {loading ? (
        <p className="text-slate-500 mt-6">Loading leave requests...</p>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mt-6 space-y-4">
          {leaves.length === 0 && (
            <p className="text-slate-500">No leave requests found.</p>
          )}

          {leaves.map((leave) => {
            const status = leave.status?.toLowerCase();

            return (
              <div
                key={leave._id}
                className="border border-slate-100 rounded-2xl p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {leave.leaveType}
                  </p>

                  <p className="text-sm text-slate-600">
                    {new Date(leave.startDate).toLocaleDateString()} →{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Reason: {leave.reason}
                  </p>

                  {leave.teacher && (
                    <p className="text-xs text-slate-500 mt-1">
                      Requested by{" "}
                      <span className="font-semibold text-slate-700">
                        {leave.teacher.name}
                      </span>{" "}
                      ({leave.teacher.email})
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize
                      ${
                        status === "approved"
                          ? "bg-green-100 text-green-700"
                          : status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {status}
                  </span>

                  {status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveLeave(leave)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setShowRejectModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Reject Leave
            </h2>

            <textarea
              value={rejectedReason}
              onChange={(e) => setRejectedReason(e.target.value)}
              placeholder="Enter reason for rejection"
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectedReason("");
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
              >
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveLeaves;
