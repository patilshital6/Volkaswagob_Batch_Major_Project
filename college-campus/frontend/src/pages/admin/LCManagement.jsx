import React, { useState, useEffect } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { CheckCircle2, XCircle, Search, FileText, ExternalLink, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LCManagement = () => {
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = () => {
        const allRequests = JSON.parse(localStorage.getItem("zeta_lc_requests") || "[]");
        setRequests(allRequests);
    };

    const approveRequest = (requestId) => {
        const allRequests = JSON.parse(localStorage.getItem("zeta_lc_requests") || "[]");
        const updated = allRequests.map(req => {
            if (req.id === requestId) {
                return {
                    ...req,
                    status: "issued",
                    issuedDate: new Date().toISOString(),
                    certificateId: `ZU-LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                };
            }
            return req;
        });
        localStorage.setItem("zeta_lc_requests", JSON.stringify(updated));
        loadRequests();
    };

    const filteredRequests = requests.filter(r =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="py-8 px-6">
            <PageHeader
                title="Certificate Registry"
                subtitle="Approval and management terminal for Institutional Leaving Certificates"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl">
                        <Hash size={32} className="text-indigo-400 mb-4" />
                        <h4 className="text-3xl font-black">{requests.filter(r => r.status === 'pending').length}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Approvals</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                        <CheckCircle2 size={32} className="text-emerald-500 mb-4" />
                        <h4 className="text-3xl font-black">{requests.filter(r => r.status === 'issued').length}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issued Records</p>
                    </div>
                </div>

                {/* Main List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search records by name or roll number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[24px] focus:ring-2 focus:ring-slate-900/5 outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{req.studentName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.rollNo} • {req.department}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'issued' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'pending' ? (
                                                    <button
                                                        onClick={() => approveRequest(req.id)}
                                                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                                    >
                                                        Review & Issue
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/certificate/${req.certificateId}`)}
                                                        className="p-2 border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-lg transition-all"
                                                        title="View Certificate"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching records found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LCManagement;
