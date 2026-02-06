import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react';
import { useExams } from '../hooks/useExams';

const Exams = () => {
    const { exams, loading, error, getNextExam } = useExams();
    const nextExam = getNextExam();

    const formatExamDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const daysUntil = (dateStr) => {
        const diff = new Date(dateStr) - new Date().setHours(0, 0, 0, 0);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="py-8 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 flex flex-col justify-center items-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Couldn't load exams</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">{error}</p>
            </div>
        );
    }

    return (
        <div className="py-8 space-y-8">
            <PageHeader
                title="Examinations"
                subtitle="Spring 2026 • Term-End Examination Schedule"
            />

            {/* Quick Stats/Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Calendar size={20} className="text-indigo-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Exam In</p>
                    </div>
                    <p className="text-2xl font-black">
                        {nextExam ? `${daysUntil(nextExam.examDate)} Days` : 'No Exams'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
                        {nextExam ? formatExamDate(nextExam.examDate) : 'Schedule Clear'}
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm shadow-slate-200/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <CheckCircle size={20} className="text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Exams</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{String(exams.length).padStart(2, '0')}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Registered Courses</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <AlertCircle size={20} className="text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900/40">Instructions</p>
                    </div>
                    <p className="text-sm font-bold text-indigo-900 leading-tight">Admit card is now available for download.</p>
                    <button className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Exam Schedule List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Your Personal Schedule</h3>
                    <div className="h-[1px] flex-1 mx-6 bg-slate-100"></div>
                </div>

                <div className="space-y-3">
                    {exams.length > 0 ? (
                        exams.map((exam) => (
                            <div key={exam._id} className="group bg-white border border-slate-100 rounded-[28px] p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Date Box */}
                                    <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-lg shadow-slate-900/20">
                                            <p className="text-xs font-black uppercase leading-none">{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-xl font-black">{new Date(exam.examDate).getDate()}</p>
                                        </div>
                                        <div className="lg:hidden">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{exam.courseName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam.courseCode}</p>
                                        </div>
                                    </div>

                                    {/* Subject Details (Desktop view) */}
                                    <div className="hidden lg:block flex-1">
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exam.courseName}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">{exam.courseCode}</span>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">Theory</span>
                                        </div>
                                    </div>

                                    {/* Timing & Venue */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-12 flex-shrink-0 lg:w-72">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Timing</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">{exam.startTime} - {exam.endTime}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Venue</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">{exam.venue}</p>
                                        </div>
                                    </div>

                                    {/* Status Icon */}
                                    <div className="lg:w-24 flex items-center justify-end flex-shrink-0">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                            <p className="text-slate-500 font-bold">No exam schedule found for your registered courses.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Support/Resource Strip */}
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Need exam support?</p>
                        <p className="text-xs text-slate-500">Contact the controller of examinations for queries regarding venues or timings.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Generate Ticket
                </button>
            </div>
        </div>
    );
};

export default Exams;
