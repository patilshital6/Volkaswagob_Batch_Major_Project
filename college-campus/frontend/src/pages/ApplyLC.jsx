import React, { useState, useEffect } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../context/AuthContext";
import { FileText, Clock, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplyLC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load existing request from localStorage
        const allRequests = JSON.parse(localStorage.getItem("zeta_lc_requests") || "[]");
        const myRequest = allRequests.find(r => r.rollNo === user?.rollNo);
        setRequest(myRequest);
    }, [user]);

    const handleApply = () => {
        setLoading(true);
        // Initialize local request process
        setTimeout(() => {
            const newRequest = {
                id: Date.now().toString(),
                studentName: user.name,
                rollNo: user.rollNo,
                department: user.department || "General Sciences",
                yearOfJoining: "2022",
                status: "pending",
                requestDate: new Date().toISOString()
            };

            const allRequests = JSON.parse(localStorage.getItem("zeta_lc_requests") || "[]");
            allRequests.push(newRequest);
            localStorage.setItem("zeta_lc_requests", JSON.stringify(allRequests));

            setRequest(newRequest);
            setLoading(false);
        }, 1500);
    };

    const isEligible = String(user?.currentYear) === '4';

    return (
        <div className="py-8 max-w-4xl mx-auto px-4">
            <PageHeader
                title="Leaving Certificate"
                subtitle="Formal application for institutional transfer documentation"
            />

            {!request ? (
                isEligible ? (
                    <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm mt-8">
                        <div className="max-w-xl mx-auto text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                                <FileText size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Apply for Certificate</h3>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    Please ensure all library dues and departmental equipment have been cleared before applying.
                                    The process typically takes 2-3 working days for administrative verification.
                                </p>
                            </div>
                            <button
                                onClick={handleApply}
                                disabled={loading}
                                className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? "Processing Application..." : "Initialize Application"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm mt-8">
                        <div className="max-w-xl mx-auto text-center space-y-6">
                            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Eligibility Required</h3>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    Leaving Certificates are exclusively issued to students in their final year of study.
                                    Our records indicate you are currently in <span className="font-bold text-slate-900">Year {user?.currentYear || '1'}</span>.
                                </p>
                                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requirements</p>
                                    <ul className="text-xs text-slate-600 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                            Must be in Final Academic Year (Year 4)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                            Completed all curriculum requirements
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-200"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )
            ) : (
                <div className="space-y-6 mt-8">
                    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${request.status === 'issued' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {request.status === 'issued' ? <CheckCircle2 size={32} /> : <Clock size={32} className="animate-pulse" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Request Status</p>
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                    {request.status === 'issued' ? "Certificate Issued" : "Verification in Progress"}
                                </h4>
                            </div>
                        </div>

                        {request.status === 'issued' && (
                            <button
                                onClick={() => navigate(`/certificate/${request.certificateId}`)}
                                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-3"
                            >
                                <Download size={18} /> View Certificate
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Application Timeline</h5>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <span className="text-emerald-500 font-bold text-xs">●</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Application Submitted</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(request.requestDate).toLocaleString()}</p>
                                </div>
                            </div>
                            {request.status === 'issued' && (
                                <div className="flex gap-4">
                                    <span className="text-emerald-500 font-bold text-xs">●</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Administrative Approval Granted</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(request.issuedDate).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplyLC;
