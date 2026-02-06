import React, { useState, useEffect } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const TicketRendering = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/tickets/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ticket fetch error:", err);
      setError("Unable to load tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setUpdatingId(ticketId);
      const response = await fetch(
        `/api/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state to reflect change immediately
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update ticket status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Open":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Closed":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <PageHeader
        title="Administrative Tickets"
        subtitle="Manage and resolve system-wide support queries"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-slate-900" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading registry...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center max-w-lg mx-auto">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Interrupted</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">{error}</p>
          <button
            onClick={fetchTickets}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-20 text-center">
          <CheckCircle2 className="mx-auto text-slate-300 mb-4" size={64} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No active tickets found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Identifier</th>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Category / Issue</th>
                  <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Context</th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actionable Status</th>
                  <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-6 font-mono text-[10px] text-slate-400">
                      #{ticket._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{ticket.issue}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md">{ticket.description}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <div className="relative inline-block w-full max-w-[140px]">
                          {updatingId === ticket._id ? (
                            <div className="flex items-center justify-center py-2 bg-slate-100 rounded-xl">
                              <Loader2 className="animate-spin text-slate-400" size={14} />
                            </div>
                          ) : (
                            <select
                              value={ticket.status}
                              onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                              className={`w-full appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-slate-900/5 ${getStatusStyles(ticket.status)}`}
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[9px] font-medium text-slate-300">
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketRendering;
