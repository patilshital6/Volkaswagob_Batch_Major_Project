import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import {
    Users,
    BookOpen,
    Calendar,
    ShieldCheck,
    Activity,
    Ticket,
    Clock,
    ChevronRight,
    Search,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const AdminHome = () => {
    const [stats, setStats] = useState({
        courses: [],
        leaves: [],
        tickets: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [coursesRes, leavesRes, ticketsRes] = await Promise.all([
                    fetch('/api/courses').then(res => res.json()).catch(() => []),
                    fetch('/api/leaves').then(res => res.json()).catch(() => ({ leaves: [] })),
                    fetch('/api/tickets/').then(res => res.json()).catch(() => [])
                ]);

                setStats({
                    courses: Array.isArray(coursesRes) ? coursesRes : [],
                    leaves: Array.isArray(leavesRes) ? leavesRes : (leavesRes.leaves || []),
                    tickets: Array.isArray(ticketsRes) ? ticketsRes : []
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const pendingLeaves = stats.leaves.filter(l => l.status?.toLowerCase() === 'pending');
    const openTickets = stats.tickets.filter(t => t.status === 'Open');

    if (loading) {
        return (
            <div className="py-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-slate-900" size={40} />
            </div>
        );
    }

    return (
        <div className="py-8 space-y-10">
            <PageHeader
                title="Admin Terminal"
                subtitle="System monitoring and management overview"
            />

            {/* Top Row: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<BookOpen className="text-blue-600" size={24} />}
                    label="Active Courses"
                    value={stats.courses.length}
                    link="/admin/all-courses"
                />
                <StatCard
                    icon={<Users className="text-amber-600" size={24} />}
                    label="Pending Leaves"
                    value={pendingLeaves.length}
                    link="/admin/approveleaves"
                    color="amber"
                />
                <StatCard
                    icon={<Ticket className="text-indigo-600" size={24} />}
                    label="Open Tickets"
                    value={openTickets.length}
                    link="/admin/tickets"
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Leaves Widget */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <Clock size={20} className="text-amber-500" />
                            Pending Approvals
                        </h3>
                        <Link to="/admin/approveleaves" className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {pendingLeaves.slice(0, 3).map((leave) => (
                            <div key={leave._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{leave.leaveType}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{leave.teacher?.name || 'Faculty Member'}</p>
                                </div>
                                <Link to="/admin/approveleaves" className="p-2 bg-white rounded-xl shadow-sm hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        ))}
                        {pendingLeaves.length === 0 && (
                            <div className="py-10 text-center text-slate-400">
                                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">All caught up</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Tickets Widget */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <Ticket size={20} className="text-indigo-500" />
                            Open Tickets
                        </h3>
                        <Link to="/admin/tickets" className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Ticket Registry</Link>
                    </div>

                    <div className="space-y-4">
                        {openTickets.slice(0, 3).map((ticket) => (
                            <div key={ticket._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-bold text-slate-900 truncate">{ticket.issue}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">Open</span>
                            </div>
                        ))}
                        {openTickets.length === 0 && (
                            <div className="py-10 text-center text-slate-400">
                                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No active issues</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Course Management Widget */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-2">
                            <BookOpen size={20} className="text-blue-600" />
                            Academic Inventory
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                            Currently hosting {stats.courses.length} courses across {new Set(stats.courses.map(c => c.department)).size} unique departments.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/admin/course-create" className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Create Course
                        </Link>
                        <Link to="/admin/all-courses" className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                            All Courses
                        </Link>
                    </div>
                </div>
            </div>

            {/* Exam Management Widget */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-2">
                            <Calendar size={20} className="text-green-600" />
                            Exam Management
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                            Create and manage examinations for all courses and departments.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/admin/exam-create" className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all">
                            Create Exam
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, link, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        indigo: "bg-indigo-50 text-indigo-600"
    };

    return (
        <Link to={link} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
                    {icon}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </Link>
    );
};

export default AdminHome;
