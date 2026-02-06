import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Clock, MapPin, User, Calendar, Info, Layers } from 'lucide-react';

const timetableData = {
    Monday: [
        { id: 1, code: 'CSE301', title: 'Database Systems', faculty: 'Dr. Mehta', time: '09:00 AM - 10:50 AM', venue: 'AB1-402', color: 'indigo' },
        { id: 2, code: 'CSE302', title: 'Computer Networks', faculty: 'Dr. Rao', time: '11:00 AM - 11:50 AM', venue: 'AB2-101', color: 'slate' },
        { id: 3, code: 'MAT201', title: 'Discrete Mathematics', faculty: 'Prof. Gupta', time: '02:00 PM - 03:50 PM', venue: 'AB1-205', color: 'blue' },
    ],
    Tuesday: [
        { id: 4, code: 'HUM101', title: 'Professional Ethics', faculty: 'Dr. Sharma', time: '10:00 AM - 11:50 AM', venue: 'AB1-LH1', color: 'purple' },
        { id: 5, code: 'CSE305', title: 'Software Engineering', faculty: 'Dr. Jain', time: '01:00 PM - 02:50 PM', venue: 'AB2-303', color: 'indigo' },
    ],
    Wednesday: [
        { id: 6, code: 'CSE301', title: 'Database Systems', faculty: 'Dr. Mehta', time: '09:00 AM - 09:50 AM', venue: 'AB1-402', color: 'indigo' },
        { id: 7, code: 'CSE304', title: 'Machine Learning', faculty: 'Dr. Singh', time: '11:00 AM - 12:50 PM', venue: 'AB2-Lab 4', color: 'indigo' },
        { id: 8, code: 'MAT201', title: 'Discrete Mathematics', faculty: 'Prof. Gupta', time: '03:00 PM - 03:50 PM', venue: 'AB1-205', color: 'blue' },
    ],
    Thursday: [
        { id: 9, code: 'CSE302', title: 'Computer Networks', faculty: 'Dr. Rao', time: '09:00 AM - 10:50 AM', venue: 'AB2-101', color: 'slate' },
        { id: 10, code: 'CSE305', title: 'Software Engineering', faculty: 'Dr. Jain', time: '11:00 AM - 11:50 AM', venue: 'AB2-303', color: 'indigo' },
        { id: 11, code: 'CSE401', title: 'Adv. Algorithms', faculty: 'Dr. Verma', time: '02:00 PM - 03:50 PM', venue: 'AB1-501', color: 'indigo' },
    ],
    Friday: [
        { id: 12, code: 'CSE304', title: 'Machine Learning', faculty: 'Dr. Singh', time: '09:00 AM - 10:50 AM', venue: 'AB2-Lab 4', color: 'indigo' },
        { id: 13, code: 'HUM101', title: 'Professional Ethics', faculty: 'Dr. Sharma', time: '11:00 AM - 11:50 AM', venue: 'AB1-LH1', color: 'purple' },
    ],
};

const Timetable = () => {
    const [activeDay, setActiveDay] = useState('Monday');
    const days = Object.keys(timetableData);

    return (
        <div className="py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title="Class Schedule"
                    subtitle="Spring 2026 • Week 04/16"
                    className="pb-0"
                />

                {/* Compact Semester Info */}
                <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                        <Layers size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">22 Credits</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/10">
                        <Info size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Exams Soon</span>
                    </div>
                </div>
            </div>

            {/* Horizontal Compact Day Picker */}
            <div className="bg-white border border-slate-100 p-2 rounded-3xl shadow-sm shadow-slate-200/50 flex flex-wrap gap-2">
                {days.map((day) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeDay === day
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Compact Timeline Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{activeDay}</h3>
                    <div className="h-[1px] flex-1 mx-6 bg-slate-100"></div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{timetableData[activeDay].length} Sessions</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {timetableData[activeDay].map((cls) => (
                        <div key={cls.id} className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

                                {/* Time Indicator */}
                                <div className="sm:w-32 flex-shrink-0">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                        <Clock size={12} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Starts at</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">{cls.time.split(' - ')[0]}</p>
                                </div>

                                <div className="hidden sm:block w-[1px] h-10 bg-slate-100"></div>

                                {/* Primary Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                            {cls.code}
                                        </span>
                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {cls.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5 leading-none">
                                            <User size={12} className="text-slate-300" />
                                            <span>{cls.faculty}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 leading-none">
                                            <MapPin size={12} className="text-slate-300" />
                                            <span>{cls.venue}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status/Type pill */}
                                <div className="flex-shrink-0">
                                    <span className={`px-4 py-2 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl`}>
                                        {cls.code.includes('Lab') ? 'Lab Session' : 'Lecture'}
                                    </span>
                                </div>

                            </div>
                        </div>
                    ))}

                    {timetableData[activeDay].length === 0 && (
                        <div className="py-16 text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[32px]">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                <Calendar size={20} />
                            </div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No classes today</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend / Secondary Info */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold">Total Duration Today</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">5 Hours 30 Minutes</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                    Download PDF Schedule
                </button>
            </div>

        </div>
    );
};

export default Timetable;
