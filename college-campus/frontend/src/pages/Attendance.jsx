import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Info, Layers } from 'lucide-react';

const attendanceData = [
    { id: 1, code: 'CSE301', title: 'Database Systems', attended: 22, total: 24 },
    { id: 2, code: 'CSE302', title: 'Computer Networks', attended: 18, total: 20 },
    { id: 3, code: 'MAT201', title: 'Discrete Mathematics', attended: 15, total: 22 },
    { id: 4, code: 'HUM101', title: 'Professional Ethics', attended: 12, total: 12 },
    { id: 5, code: 'CSE305', title: 'Software Engineering', attended: 20, total: 24 },
    { id: 6, code: 'CSE304', title: 'Machine Learning', attended: 19, total: 20 },
    { id: 7, code: 'CSE401', title: 'Adv. Algorithms', attended: 14, total: 16 },
];

const Attendance = () => {
    const getEligibility = (percentage) => {
        return percentage >= 75 ? 'ELIGIBLE' : 'NOT ELIGIBLE';
    };

    const getStatusStyle = (percentage) => {
        if (percentage >= 75) return 'text-green-600 bg-green-50 border-green-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'bg-indigo-600';
        return 'bg-red-500';
    };

    return (
        <div className="py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title="Attendance"
                    subtitle="Spring 2026 • Week 04/16"
                    className="pb-0"
                />

                {/* Compact Semester Info */}
                <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                        <Layers size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">75% Criteria</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/10">
                        <Info size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Spring 2026</span>
                    </div>
                </div>
            </div>

            {/* Grid of Compact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attendanceData.map((course) => {
                    const percentage = Math.round((course.attended / course.total) * 100);
                    const isEligible = percentage >= 75;

                    return (
                        <div key={course.id} className="group bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest mb-1.5 inline-block">
                                        {course.code}
                                    </span>
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">
                                        {course.title}
                                    </h4>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(percentage)}`}>
                                    {getEligibility(percentage)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={14} className="text-slate-300" />
                                        <p className="text-[11px] font-bold text-slate-500">
                                            {course.attended} <span className="text-slate-300 mx-1">/</span> {course.total} Sessions
                                        </p>
                                    </div>
                                    <p className="text-lg font-black text-slate-900">{percentage}%</p>
                                </div>

                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${getProgressColor(percentage)}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle size={12} className="text-green-500" />
                                            <span>{course.attended} P</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <XCircle size={12} className="text-red-500" />
                                            <span>{course.total - course.attended} A</span>
                                        </div>
                                    </div>
                                    {!isEligible && (
                                        <div className="flex items-center gap-1 text-red-500">
                                            <AlertTriangle size={12} />
                                            <span>Shortage</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default Attendance;
