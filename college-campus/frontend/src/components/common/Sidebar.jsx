import {
    Home as HomeIcon,
    Calendar,
    Clock,
    FileText,
    CreditCard,
    User,
    TrendingUp,
    X,
    Ticket,
    ClipboardList,
    GraduationCap,
    CalendarDays,
    Activity,
    FilePlus2,
    UserPlus,
    ClipboardCheck,
    BookPlus,
    BookOpen,
    ClipboardPlus
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
    { name: 'Home', icon: HomeIcon, path: '/', roles: ['student', 'teacher', 'admin'] },
    { name: 'Profile', icon: User, path: '/profile', roles: ['student', 'teacher'] },
    { name: 'Attendance', icon: Activity, path: '/attendance', roles: ['student'] },
    { name: 'Timetable', icon: Clock, path: '/timetable', roles: ['student'] },
    { name: 'Exams', icon: ClipboardList, path: '/exams', roles: ['student'] },
    { name: 'Assignments', icon: FileText, path: '/assignments', roles: ['student'] },
    { name: 'Academic Calendar', icon: CalendarDays, path: '/calendar', roles: ['student', 'teacher'] },
    { name: 'Events', icon: Calendar, path: '/events', roles: ['student', 'teacher'] },
    { name: 'Fee Payment', icon: CreditCard, path: '/fees', roles: ['student'] },
    { name: 'Course Regs', icon: GraduationCap, path: '/registration', roles: ['student'] },
    { name: 'Grades', icon: TrendingUp, path: '/grades', roles: ['student'] },
    { name: 'Ticketing Support', icon: Ticket, path: '/support', roles: ['student', 'teacher'] },
    { name: 'Create Assignment', icon: FilePlus2, path: '/teacher/assignments/new', roles: ['teacher'] },
    { name: 'Assignment Submissions', icon: ClipboardCheck, path: '/teacher/assignments/submissions', roles: ['teacher'] },
    { name: 'Class List', icon: GraduationCap, path: '/teacher/classlist', roles: ['teacher'] },
    { name: 'Course Allocation', icon: UserPlus, path: '/teacher/allotcourse', roles: ['teacher'] },
    { name: 'Create Course', icon: BookPlus, path: '/admin/course-create', roles: ['admin'] },
    { name: 'All Courses', icon: BookOpen, path: '/admin/all-courses', roles: ['admin'] },
    { name: 'Create Exam', icon: ClipboardPlus, path: '/admin/exam-create', roles: ['admin'] },
    { name: 'Leaves', icon: UserPlus, path: '/teacher/leaves', roles: ['teacher'] },
    { name: 'Leave Requests', icon: UserPlus, path: '/admin/approveleaves', roles: ['admin'] },
    { name: 'University Leaving Cert', icon: FileText, path: '/apply-lc', roles: ['student'] },
    { name: 'Certificate Registry', icon: FileText, path: '/admin/lc-management', roles: ['admin'] },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const role = user?.role || 'student';
    const visibleItems = sidebarItems.filter((item) => !item.roles || item.roles.includes(role));

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-72 bg-white transform transition-transform duration-300 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Navigation</span>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-900">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {visibleItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
