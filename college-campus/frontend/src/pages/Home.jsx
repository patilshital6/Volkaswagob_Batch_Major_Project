import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useEvents } from '../hooks/useEvents';
import { useAssignments } from '../hooks/useAssignments';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, ArrowRight, BookOpen, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

import HeroCarousel from '../components/common/HeroCarousel';

const Home = () => {
    const { user } = useAuth();
    const { events, loading: eventsLoading } = useEvents();
    const { assignments, loading: assignmentsLoading } = useAssignments();

    const formatDate = (date) => {
        if (!date) return 'No due date';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return date;
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const normalizeAssignment = (assignment) => {
        const submissions = assignment?.submissions || [];
        const status = submissions.length > 0 ? 'submitted' : 'pending';
        return {
            id: assignment?._id || assignment?.id,
            title: assignment?.title || 'Untitled Assignment',
            course: assignment?.course?.courseName || assignment?.courseName || assignment?.course || 'Course',
            dueDate: formatDate(assignment?.dueDate || assignment?.deadline),
            status,
            weight: assignment?.weight || 10,
        };
    };

    const upcomingAssignments = assignments
        .map(normalizeAssignment)
        .filter((a) => a.status !== 'submitted')
        .sort((a, b) => {
            const aDate = new Date(a.dueDate);
            const bDate = new Date(b.dueDate);
            const aTime = Number.isNaN(aDate.getTime()) ? Infinity : aDate.getTime();
            const bTime = Number.isNaN(bDate.getTime()) ? Infinity : bDate.getTime();
            return aTime - bTime;
        })
        .slice(0, 3);

    return (
        <div className="py-8 space-y-12">
            <PageHeader
                title={`Welcome Back, ${user?.name?.split(' ')[0] || 'Student'}`}
                subtitle="Here's what is happening on campus today."
            />

            {/* Top Section: Scrolling Carousel */}
            <HeroCarousel />

            {/* Bottom Section: Split Columns */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Left Half: Upcoming Assignments */}
                <HomeListSection
                    title="Assignments"
                    subtitle="Upcoming assignments"
                    link="/assignments"
                    items={upcomingAssignments}
                    isLoading={assignmentsLoading}
                    renderItem={(assignment) => (
                        <div key={assignment.id} className="group flex gap-5 p-5 rounded-[24px] border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer h-[110px]">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex-shrink-0 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <BookOpen size={20} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{assignment.title}</h4>
                                        <span className="flex-shrink-0 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">{assignment.weight}%</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{assignment.course}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={12} className="text-slate-300" />
                                    <span>Due {assignment.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    )}
                />

                {/* Right Half: Upcoming Events */}
                <HomeListSection
                    title="Events"
                    subtitle="Don't miss out on campus life"
                    link="/events"
                    items={events.slice(0, 3)}
                    isLoading={eventsLoading}
                    renderItem={(event) => (
                        <div key={event._id} className="group flex gap-5 p-5 rounded-[24px] border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer h-[110px]">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10">
                                <Bell size={20} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{event.title}</h4>
                                        <span className="flex-shrink-0 text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">{event.category}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{event.venue}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest">
                                    <Calendar size={12} className="text-indigo-600" />
                                    <span className="text-slate-900 font-black uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </section>
        </div>
    );
};

// Internal Helper for Homepage symmetry
const HomeListSection = ({ title, subtitle, link, items, renderItem, isLoading }) => (
    <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm shadow-slate-200/50 flex flex-col h-full min-h-[520px]">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
            <Link to={link} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="space-y-4 flex-1">
            {isLoading ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
                </div>
            ) : items.length > 0 ? (
                items.map(renderItem)
            ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">All caught up!</p>
                </div>
            )}
        </div>

        <Link to={link} className="mt-8 py-4 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            See All {title}
        </Link>
    </div>
);

export default Home;
