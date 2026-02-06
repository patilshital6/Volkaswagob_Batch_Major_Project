import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ChevronLeft, ShieldCheck, Award } from "lucide-react";

const CertificateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [certData, setCertData] = useState(null);

    useEffect(() => {
        const allRequests = JSON.parse(localStorage.getItem("zeta_lc_requests") || "[]");
        const found = allRequests.find(r => r.certificateId === id);
        setCertData(found);
    }, [id]);

    if (!certData) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4 print:bg-white print:p-0">
            {/* Header / Controls - Hidden on print */}
            <div className="max-w-[1000px] w-full flex justify-between items-center mb-8 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ChevronLeft size={18} /> Back to Dashboard
                </button>
                <button
                    onClick={handlePrint}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                    <Printer size={16} /> Print Document
                </button>
            </div>

            {/* The Certificate - Actual Content */}
            <div className="bg-white max-w-[1000px] w-full aspect-[1.414/1] shadow-2xl relative overflow-hidden border-[16px] border-double border-slate-200 print:shadow-none print:border-[12px]">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-indigo-600 m-8"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-indigo-600 m-8"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-indigo-600 m-8"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-indigo-600 m-8"></div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-25deg] pointer-events-none">
                    <span className="text-[200px] font-black">ZETA</span>
                </div>

                <div className="relative z-10 p-20 flex flex-col h-full items-center text-center">
                    {/* Uni Branding */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <span className="text-xl font-black">ZU</span>
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-black tracking-[0.3em] text-slate-900 uppercase">Zeta University</h1>
                            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Registered Institutional Registry</p>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-slate-100 mb-12"></div>

                    {/* Main Text */}
                    <h2 className="text-5xl font-serif text-slate-800 italic mb-8">Leaving Certificate</h2>
                    <p className="text-sm text-slate-500 uppercase tracking-widest mb-10">This is to officially certify that</p>

                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4 border-b-2 border-slate-900 pb-2 inline-block">
                        {certData.studentName}
                    </h3>

                    <p className="text-sm text-slate-600 leading-loose max-w-2xl mt-8">
                        bearing identifier <span className="font-bold text-slate-900">#{certData.rollNo}</span> has successfully participated in the academic curriculum of the
                        <span className="font-bold text-slate-900"> {certData.department} Department</span> at Zeta University. He/She has sustained a commendable
                        conduct during the tenure of study from <span className="font-bold text-slate-900">{certData.yearOfJoining}</span> to
                        <span className="font-bold text-slate-900"> {new Date(certData.issuedDate).getFullYear()}</span>.
                        As of the date of issue, the candidate is formally discharged from the institution with no outstanding dues.
                    </p>

                    <div className="mt-auto w-full grid grid-cols-3 items-end pt-12">
                        <div className="text-left flex flex-col items-start gap-4">
                            <div className="w-24 h-24 border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-200">
                                <ShieldCheck size={48} className="opacity-20" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Registry Seal</p>
                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{certData.certificateId}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <Award size={64} className="text-indigo-600 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Official Document</p>
                        </div>

                        <div className="text-right">
                            <div className="h-[1px] bg-slate-300 w-48 mb-2 ml-auto"></div>
                            <p className="text-xs font-bold text-slate-900 uppercase">Registrar of Zeta University</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Dated: {new Date(certData.issuedDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { background: white; }
                    .print-hidden { display: none; }
                }
            `}} />
        </div>
    );
};

export default CertificateView;
