import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2)); // Feb 2, 2026 (month is 0-indexed)
    const [selectedDateDetail, setSelectedDateDetail] = useState(null);
    
    const isTeacher = user?.role === 'teacher';
    const isStudent = user?.role === 'student';

    // Later: replace with API data
    // Assignment due dates
    const assignmentDueDates = {
        '2026-02-14': { title: 'Data Structures: Linked Lists Implementation', id: 1 },
        '2026-03-15': { title: 'Database Design Project', id: 2 },
        '2026-03-20': { title: 'Web Development: React Component Library', id: 3 },
        '2026-02-28': { title: 'Algorithm Analysis Essay', id: 4 },
        '2026-04-05': { title: 'Operating Systems: Shell Implementation', id: 5 },
        '2026-04-12': { title: 'Machine Learning: Regression Model', id: 6 },
    };

    // Common academic events for all roles
    const commonEvents = {
        '2026-01-25': { title: 'Spring Semester Starts', type: 'important', color: 'blue', roles: ['student', 'teacher'] },
        '2026-01-26': { title: 'Republic Day', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-02-14': { title: 'Mid-term Exams Begin', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-02-28': { title: 'Mid-term Exams End', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-03-29': { title: 'Holi - Festival of Colors', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-05-01': { title: 'Final Exams Begin', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-05-13': { title: 'Eid ul-Fitr', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-05-20': { title: 'Final Exams End', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-06-01': { title: 'Summer Session Starts', type: 'important', color: 'blue', roles: ['student', 'teacher'] },
        '2026-07-20': { title: 'Eid ul-Adha (Bakrid)', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-08-15': { title: 'Fall Semester Starts & Independence Day', type: 'important', color: 'blue', roles: ['student', 'teacher'] },
        '2026-08-23': { title: 'Janmashtami - Lord Krishna Birth', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-09-05': { title: 'Labor Day (No Classes)', type: 'holiday', color: 'green', roles: ['student', 'teacher'] },
        '2026-09-25': { title: 'Navratri Begins', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-10-02': { title: 'Gandhi Jayanti', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-10-03': { title: 'Dussehra - Victory of Good over Evil', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-10-29': { title: 'Diwali - Festival of Lights', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-10-31': { title: 'Halloween', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-11-01': { title: 'Fall Mid-term Exams', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-11-30': { title: 'Guru Nanak Jayanti', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
        '2026-12-10': { title: 'Final Exams Begin', type: 'exam', color: 'red', roles: ['student', 'teacher'] },
        '2026-12-20': { title: 'Semester Ends', type: 'important', color: 'blue', roles: ['student', 'teacher'] },
        '2026-12-25': { title: 'Christmas', type: 'festival', color: 'purple', roles: ['student', 'teacher'] },
    };

    // Student-specific events
    const studentEvents = {
        '2026-03-15': { title: 'Assignment Submission Deadline', type: 'deadline', color: 'orange', assignment: assignmentDueDates['2026-03-15'], roles: ['student'] },
        '2026-03-20': { title: 'Web Dev Project Due', type: 'deadline', color: 'orange', assignment: assignmentDueDates['2026-03-20'], roles: ['student'] },
        '2026-04-05': { title: 'OS Assignment Due', type: 'deadline', color: 'orange', assignment: assignmentDueDates['2026-04-05'], roles: ['student'] },
        '2026-04-12': { title: 'ML Project Due', type: 'deadline', color: 'orange', assignment: assignmentDueDates['2026-04-12'], roles: ['student'] },
        '2026-05-25': { title: 'Grades Released', type: 'important', color: 'blue', roles: ['student'] },
        '2026-10-15': { title: 'Mid-semester Projects Due', type: 'deadline', color: 'orange', roles: ['student'] },
        '2026-12-01': { title: 'Final Projects Due', type: 'deadline', color: 'orange', roles: ['student'] },
    };

    // Teacher-specific events
    const teacherEvents = {
        '2026-02-12': { title: 'Mid-term Exam Papers Due', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-03-05': { title: 'Grade Submission Deadline (Mid-term)', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-03-15': { title: 'Assignment Grading Due', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-04-28': { title: 'Final Exam Papers Due', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-05-25': { title: 'Final Grades Submission', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-06-15': { title: 'Faculty Meeting', type: 'important', color: 'blue', roles: ['teacher'] },
        '2026-10-15': { title: 'Project Evaluation Week', type: 'important', color: 'blue', roles: ['teacher'] },
        '2026-11-15': { title: 'Grade Submission (Fall Mid-term)', type: 'deadline', color: 'orange', roles: ['teacher'] },
        '2026-12-01': { title: 'Course Feedback Review', type: 'important', color: 'blue', roles: ['teacher'] },
    };

    // Merge events based on role
    const academicEvents = {
        ...commonEvents,
        ...(isStudent ? studentEvents : {}),
        ...(isTeacher ? teacherEvents : {})
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date(2026, 1, 2)); // Feb 2, 2026
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const eventTypeStyles = {
        important: 'bg-blue-100 text-blue-800 border-blue-300',
        exam: 'bg-red-100 text-red-800 border-red-300',
        deadline: 'bg-orange-100 text-orange-800 border-orange-300',
        holiday: 'bg-green-100 text-green-800 border-green-300',
        festival: 'bg-purple-100 text-purple-800 border-purple-300',
    };

    return (
        <div className='py-8 bg-slate-50 min-h-screen'>
            <PageHeader title='Academic Calendar' subtitle='Important dates and deadlines.' />

            <div className='max-w-7xl mx-auto px-4'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Main Calendar */}
                    <div className='lg:col-span-3'>
                        <div className='bg-white rounded-lg shadow-lg p-8'>
                            {/* Month Navigation */}
                            <div className='flex items-center justify-between mb-8'>
                                <h2 className='text-3xl font-bold text-slate-800'>
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className='flex gap-3'>
                                    <button
                                        onClick={handlePrevMonth}
                                        className='p-2 hover:bg-slate-100 rounded-lg transition border border-slate-200'
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleToday}
                                        className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium'
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={handleNextMonth}
                                        className='p-2 hover:bg-slate-100 rounded-lg transition border border-slate-200'
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Day Names Header */}
                            <div className='grid grid-cols-7 gap-0 mb-2 border-b-2 border-slate-200'>
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className='text-center font-bold text-slate-700 text-sm py-3 px-2'
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className='grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden'>
                                {days.map((day, index) => {
                                    const dateKey = day
                                        ? formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
                                        : null;
                                    const event = dateKey ? academicEvents[dateKey] : null;
                                    const isToday =
                                        day === 2 &&
                                        currentDate.getMonth() === 1 &&
                                        currentDate.getFullYear() === 2026;
                                    const isCurrentMonth = day !== null;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => day && setSelectedDateDetail(day)}
                                            className={`
                                min-h-32 border border-slate-200 p-3 cursor-pointer transition hover:bg-blue-50
                                ${!isCurrentMonth ? 'bg-slate-50' : 'bg-white'}
                                ${isToday ? 'bg-blue-100 border-2 border-blue-500' : ''}
                            `}
                                        >
                                            <div className='flex items-start justify-between mb-2'>
                                                <span className={`text-lg font-bold ${
                                                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                                                }`}>
                                                    {day}
                                                </span>
                                                {event && (
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            event.color === 'blue'
                                                                ? 'bg-blue-500'
                                                                : event.color === 'red'
                                                                    ? 'bg-red-500'
                                                                    : event.color === 'orange'
                                                                        ? 'bg-orange-500'
                                                                        : event.color === 'purple'
                                                                            ? 'bg-purple-500'
                                                                            : 'bg-green-500'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                            {event && (
                                                <div className='text-xs text-slate-600 line-clamp-2 hover:line-clamp-none'>
                                                    <p className='font-medium text-slate-700'>{event.title}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='lg:col-span-1'>
                        {/* Legend Card */}
                        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
                            <h3 className='text-lg font-bold text-slate-800 mb-4'>Event Types</h3>
                            <div className='space-y-3'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0'></div>
                                    <div>
                                        <p className='text-sm font-medium text-slate-700'>Important</p>
                                        <p className='text-xs text-slate-500'>Semesters, grades</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0'></div>
                                    <div>
                                        <p className='text-sm font-medium text-slate-700'>Exams</p>
                                        <p className='text-xs text-slate-500'>Midterm & Finals</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-orange-500 mt-1 shrink-0'></div>
                                    <div>
                                        <p className='text-sm font-medium text-slate-700'>Deadlines</p>
                                        <p className='text-xs text-slate-500'>Assignments due</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0'></div>
                                    <div>
                                        <p className='text-sm font-medium text-slate-700'>Festivals</p>
                                        <p className='text-xs text-slate-500'>Holidays & festivals</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events Card */}
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <h3 className='text-lg font-bold text-slate-800 mb-4'>Upcoming</h3>
                            <div className='space-y-2 max-h-64 overflow-y-auto'>
                                {Object.entries(academicEvents)
                                    .filter(([date]) => new Date(date) >= currentDate)
                                    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                                    .slice(0, 6)
                                    .map(([date, event]) => (
                                        <div
                                            key={date}
                                            className='p-2 rounded border-l-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition'
                                            style={{
                                                borderLeftColor: 
                                                    event.color === 'blue' ? '#3B82F6' :
                                                    event.color === 'red' ? '#EF4444' :
                                                    event.color === 'orange' ? '#F97316' :
                                                    '#A855F7'
                                            }}
                                        >
                                            <p className='text-xs font-medium text-slate-700 line-clamp-2'>{event.title}</p>
                                            <p className='text-xs text-slate-500'>
                                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    ))}
                            </div>

                            {isStudent && (
                                <button 
                                    onClick={() => navigate('/assignments')}
                                    className='w-full mt-4 px-3 py-2 rounded bg-blue-500 text-white text-sm transition hover:bg-blue-600 font-medium'
                                >
                                    📋 Assignments
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Detail Modal */}
            {selectedDateDetail && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-lg shadow-lg max-w-md w-full'>
                        <div className='p-6'>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-xl font-bold text-slate-800'>
                                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDateDetail).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </h2>
                                <button
                                    onClick={() => setSelectedDateDetail(null)}
                                    className='text-slate-400 hover:text-slate-600 text-2xl'
                                >
                                    ✕
                                </button>
                            </div>

                            {(() => {
                                const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDateDetail);
                                const event = academicEvents[dateKey];
                                return event ? (
                                    <div className={`p-4 rounded-lg border-l-4 ${eventTypeStyles[event.type]}`}>
                                        <h3 className='font-bold mb-2'>{event.title}</h3>
                                        <p className='text-sm opacity-75 mb-3'>Type: {event.type.replace('-', ' ')}</p>
                                        {event.assignment && (
                                            <button
                                                onClick={() => {
                                                    navigate('/assignments');
                                                    setSelectedDateDetail(null);
                                                }}
                                                className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-medium text-sm'
                                            >
                                                View Assignment
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className='text-slate-600'>No events scheduled for this date.</p>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
