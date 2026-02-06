import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();
    const role = user?.role || 'student';

    const footerLinks = [
        {
            title: 'Academic',
            links: [
                { name: 'Courses', path: '/registration', roles: ['student'] },
                { name: 'Calendar', path: '/calendar', roles: ['student', 'teacher'] },
                { name: 'Exams', path: '/exams', roles: ['student'] },
                { name: 'Assignments', path: '/assignments', roles: ['student'] },
                { name: 'Create Assignment', path: '/teacher/assignments/new', roles: ['teacher'] },
                { name: 'Class List', path: '/teacher/classlist', roles: ['teacher'] },
                { name: 'Course Management', path: '/admin/all-courses', roles: ['admin'] },
                { name: 'Leave Approvals', path: '/admin/approveleaves', roles: ['admin'] }
            ]
        },
        {
            title: 'Services',
            links: [
                { name: 'Finance', path: '/fees', roles: ['student'] },
                { name: 'IT Support', path: '/support', roles: ['student', 'teacher'] },
                { name: 'Attendance', path: '/attendance', roles: ['student'] },
                { name: 'Grades', path: '/grades', roles: ['student'] },
                { name: 'Assignment Submissions', path: '/teacher/assignments/submissions', roles: ['teacher'] },
                { name: 'Manage Tickets', path: '/admin/tickets', roles: ['admin'] }
            ]
        },
        {
            title: 'University',
            links: [
                { name: 'Profile', path: '/profile', roles: ['student', 'teacher'] },
                { name: 'About', path: '#', roles: ['student', 'teacher', 'admin'] },
                { name: 'Contact', path: '/contact', roles: ['student', 'teacher', 'admin'] },
                { name: 'Help Center', path: '/help', roles: ['student', 'teacher', 'admin'] }
            ]
        }
    ];

    // Filter loops to remove links not belonging to current role
    const filteredSections = footerLinks.map(section => ({
        ...section,
        links: section.links.filter(link => link.roles.includes(role))
    })).filter(section => section.links.length > 0);

    return (
        <footer className="w-full bg-slate-900 text-white py-16 px-6 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col items-center">
                {/* Centered Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center w-full mb-16">
                    {filteredSections.map((section) => (
                        <div key={section.title} className="flex flex-col items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-xs text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Centered Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 w-full flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Zeta University</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                        <p>© {new Date().getFullYear()} Zeta University</p>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/help" className="hover:text-white transition-colors">Help</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
