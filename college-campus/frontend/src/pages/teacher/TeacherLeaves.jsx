import React, { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import ApplyLeaveForm from "./ApplyLeaveForm";

const TeacherLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaves?teacher=${user.id}`);
      const data = await res.json();
      setLeaves(data.leaves || data);
    } catch (err) {
      alert("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchLeaves();
  }, [user?.id]);
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <PageHeader
        title="My Leaves"
        subtitle="View your leave history and apply for new leaves"
      />

      {/* ACTION BAR */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          Apply Leave
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading leave history...</p>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          {leaves.length === 0 && (
            <p className="text-slate-500">No leave records found.</p>
          )}

          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="border border-slate-100 rounded-2xl p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-bold text-slate-900">{leave.leaveType}</p>

                <p className="text-sm text-slate-600">
                  {new Date(leave.startDate).toLocaleDateString()} →{" "}
                  {new Date(leave.endDate).toLocaleDateString()}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Reason: {leave.reason}
                </p>

                {leave.status === "rejected" && (
                  <p className="text-sm text-red-600 mt-1">
                    Rejected: {leave.rejectedReason}
                  </p>
                )}
              </div>

<span
  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${getStatusStyle(
    leave.status.toLowerCase()
  )}`}
>
  {leave.status}
</span>

            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
            <ApplyLeaveForm
              onSuccess={fetchLeaves}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaves;
