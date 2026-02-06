import { useMemo, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Download, Upload, X } from 'lucide-react';
import { useAssignments } from '../hooks/useAssignments';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
    submitted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    'in-progress': 'bg-slate-50 text-slate-700 border-slate-100',
    overdue: 'bg-red-50 text-red-700 border-red-100',
};

const StatusPill = ({ status }) => (
    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusStyles[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        {status}
    </span>
);

const getStatusIcon = (status) => {
    switch (status) {
        case 'submitted': return <CheckCircle size={14} />;
        case 'pending': return <Clock size={14} />;
        case 'in-progress': return <FileText size={14} />;
        case 'overdue': return <AlertCircle size={14} />;
        default: return null;
    }
};

const formatDate = (date) => {
    if (!date) return 'No due date';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeAssignment = (assignment) => {
    const submissions = assignment?.submissions || [];
    const status = submissions.length > 0 ? 'submitted' : 'pending';

    const courseName = assignment?.course?.courseName
        || assignment?.course?.name
        || assignment?.courseName
        || assignment?.course
        || 'Course';

    const courseCode = assignment?.course?.courseCode
        || assignment?.course?.code
        || assignment?.courseCode
        || assignment?.code
        || assignment?.course_id
        || 'N/A';

    return {
        ...assignment,
        id: assignment?._id || assignment?.id,
        title: assignment?.title || 'Untitled Assignment',
        description: assignment?.description || '',
        courseName,
        courseCode,
        dueDate: assignment?.dueDate || assignment?.deadline || assignment?.due || '',
        submissions,
        submissionFiles: submissions
            .map((s) => s?.fileUrl || s?.file || s?.fileName)
            .filter(Boolean),
        status,
        __raw: assignment,
    };
};

const Assignments = () => {
    const { user } = useAuth();
    const { assignments, loading, error, submitAssignment } = useAssignments();

    const [filter, setFilter] = useState('all');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submissionData, setSubmissionData] = useState({ courseCode: '', fileUrl: '' });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const normalizedAssignments = useMemo(() => {
        const map = new Map();
        assignments.forEach((assignment) => {
            const normalized = normalizeAssignment(assignment);
            const key = normalized.id || `${normalized.title}-${normalized.courseCode}`;
            if (!map.has(key)) {
                map.set(key, normalized);
            }
        });
        return Array.from(map.values());
    }, [assignments]);

    const filteredAssignments = normalizedAssignments.filter((assignment) => {
        if (filter === 'all') return true;
        return assignment.status === filter;
    });

    const overallProgress = normalizedAssignments.length === 0
        ? 0
        : Math.round(
            (normalizedAssignments.filter((a) => a.status === 'submitted').length / normalizedAssignments.length) * 100
        );

    const handleAssignmentSelect = (assignment) => {
        setFeedback(null);
        const normalized = normalizeAssignment(assignment);
        setSelectedAssignment(normalized);
        setSubmissionData((prev) => ({
            ...prev,
            courseCode: normalized.courseCode !== 'N/A' ? normalized.courseCode : '',
        }));
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        if (!submissionData.courseCode || !submissionData.fileUrl) {
            setFeedback({ type: 'error', text: 'Course code and file URL are required.' });
            return;
        }

        setSubmitting(true);
        setFeedback(null);
        try {
            const courseCode = submissionData.courseCode
                || selectedAssignment.__raw?.course?.courseCode
                || selectedAssignment.__raw?.courseCode
                || selectedAssignment.courseCode;

            await submitAssignment({
                assignmentId: selectedAssignment.id,
                courseCode,
                rollNo: user?.rollNo,
                fileUrl: submissionData.fileUrl,
            });

            setFeedback({ type: 'success', text: 'Assignment submitted successfully' });
            setShowSubmitForm(false);
            setSubmissionData({ courseCode: '', fileUrl: '' });
            setSelectedAssignment(null);
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className='py-8 space-y-8'>
            <PageHeader
                title='Assignments'
                subtitle='Track and manage your academic coursework and deadlines.'
            />

            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <FileText size={20} className="text-indigo-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Tasks</p>
                    </div>
                    <p className="text-2xl font-black">{String(normalizedAssignments.length).padStart(2, '0')}</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Active Assignments</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <CheckCircle size={20} className="text-indigo-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {String(normalizedAssignments.filter(a => a.status === 'submitted').length).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Completed</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                        {String(normalizedAssignments.filter(a => a.status === 'pending').length).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">To Do</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900/40">Progress</p>
                        <span className="text-sm font-black text-indigo-600">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-indigo-200/50 rounded-full h-1.5 mb-3">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-widest">Course Progress</p>
                </div>
            </div>

            {feedback && (
                <div className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border animate-fadeIn ${feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {feedback.text}
                </div>
            )}

            {/* Filter Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Assignment Feed</h3>
                    <div className="h-[1px] flex-1 mx-6 bg-slate-100"></div>
                </div>

                <div className='flex gap-2 flex-wrap'>
                    {['all', 'submitted', 'pending'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === s
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className='space-y-3'>
                    {filteredAssignments.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No assignments found in this category</p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                onClick={() => handleAssignmentSelect(assignment)}
                                className='group bg-white border border-slate-100 rounded-[28px] p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer'
                            >
                                <div className='flex flex-col lg:flex-row lg:items-center gap-6'>
                                    {/* Date/Icon Box */}
                                    <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105 bg-slate-900 text-white shadow-slate-200">
                                            <p className="text-[9px] font-black uppercase leading-none mb-1">Due</p>
                                            <p className="text-lg font-black">{new Date(assignment.dueDate).getDate() || '--'}</p>
                                        </div>
                                        <div className="lg:hidden">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{assignment.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.courseCode}</p>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="hidden lg:block flex-1">
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {assignment.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">{assignment.courseCode}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignment.courseName}</span>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-12 flex-shrink-0 lg:w-80">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Deadline</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">{formatDate(assignment.dueDate)}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <StatusPill status={assignment.status} />
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    <div className="lg:w-20 flex items-center justify-end">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                            <Upload size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        ))}
                </div>
            </div>


            {selectedAssignment && !showSubmitForm && (
                <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn'>
                    <div className='bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-8 md:p-12 border border-white/20 transform animate-slideUp'>
                        <div className='flex justify-between items-start mb-8'>
                            <div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                                    {selectedAssignment.courseCode}
                                </span>
                                <h2 className='text-3xl font-black text-slate-900 tracking-tight'>{selectedAssignment.title}</h2>
                            </div>
                            <button onClick={() => setSelectedAssignment(null)} className='p-2 hover:bg-slate-100 rounded-full transition-colors'>
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <p className='text-slate-500 leading-relaxed mb-10 text-lg'>{selectedAssignment.description}</p>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
                            <div className='bg-slate-50 p-6 rounded-3xl border border-slate-100'>
                                <p className='text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2'>Course Details</p>
                                <p className='font-bold text-slate-900'>{selectedAssignment.courseName}</p>
                            </div>
                            <div className='bg-slate-50 p-6 rounded-3xl border border-slate-100'>
                                <p className='text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2'>Submission Status</p>
                                <div className='flex items-center gap-2'>
                                    <div className={selectedAssignment.status === 'submitted' ? 'text-indigo-600' : 'text-amber-500'}>
                                        {getStatusIcon(selectedAssignment.status)}
                                    </div>
                                    <p className='font-black text-slate-900 uppercase tracking-widest text-[11px]'>{selectedAssignment.status}</p>
                                </div>
                            </div>
                        </div>

                        {selectedAssignment.status === 'submitted' && selectedAssignment.submissions && selectedAssignment.submissions.length > 0 && (() => {
                            const userSubmission = selectedAssignment.submissions[0];
                            const hasGrade = userSubmission?.marks !== null && userSubmission?.marks !== undefined;
                            
                            if (hasGrade) {
                                return (
                                    <div className='bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-10'>
                                        <div className='flex items-center gap-3 mb-4'>
                                            <CheckCircle size={20} className='text-emerald-600' />
                                            <p className='text-[10px] font-black uppercase text-emerald-900 tracking-widest'>Graded</p>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div>
                                                <p className='text-[10px] font-black uppercase text-emerald-900/60 tracking-widest mb-2'>Score</p>
                                                <p className='text-3xl font-black text-emerald-900'>{userSubmission.marks}</p>
                                            </div>
                                            {userSubmission.feedback && (
                                                <div>
                                                    <p className='text-[10px] font-black uppercase text-emerald-900/60 tracking-widest mb-2'>Feedback</p>
                                                    <p className='text-sm text-emerald-900 leading-relaxed'>{userSubmission.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                        {userSubmission.gradedAt && (
                                            <p className='text-[10px] text-emerald-900/60 mt-4 font-bold'>Graded on {formatDate(userSubmission.gradedAt)}</p>
                                        )}
                                    </div>
                                );
                            } else {
                                return (
                                    <div className='bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-10'>
                                        <div className='flex items-center gap-3'>
                                            <Clock size={20} className='text-amber-600' />
                                            <div>
                                                <p className='text-[10px] font-black uppercase text-amber-900 tracking-widest'>Not Graded Yet</p>
                                                <p className='text-xs text-amber-900/60 mt-1'>Your submission is awaiting review by the instructor.</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()}

                        <button
                            onClick={() => setShowSubmitForm(true)}
                            className='w-full py-5 bg-slate-900 text-white rounded-[24px] font-black tracking-[0.2em] text-[11px] uppercase hover:bg-slate-800 transition-all shadow-xl shadow-slate-200'
                        >
                            Proceed to Submission
                        </button>
                    </div>
                </div>
            )}

            {showSubmitForm && (
                <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn'>
                    <div className='bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 md:p-12 border border-white/20 animate-slideUp'>
                        <div className='flex justify-between items-start mb-10'>
                            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>Submit Work</h2>
                            <button onClick={() => setShowSubmitForm(false)} className='p-2 hover:bg-slate-100 rounded-full transition-colors'>
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitAssignment} className='space-y-8'>
                            <div className="space-y-2">
                                <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2'>Course Code</label>
                                <input
                                    type='text'
                                    value={submissionData.courseCode}
                                    onChange={(e) => setSubmissionData({ ...submissionData, courseCode: e.target.value })}
                                    className='w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all'
                                    placeholder='e.g., CSE103'
                                />
                            </div>
                            <div className="space-y-2">
                                <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2'>Submission Link / URL</label>
                                <input
                                    type='url'
                                    value={submissionData.fileUrl}
                                    onChange={(e) => setSubmissionData({ ...submissionData, fileUrl: e.target.value })}
                                    className='w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all'
                                    placeholder='https://github.com/...'
                                />
                                <p className='text-[10px] text-slate-400 px-2 font-bold uppercase tracking-widest mt-3 flex items-center gap-2'>
                                    <FileText size={12} /> External resource link preferred
                                </p>
                            </div>
                            <button
                                type='submit'
                                disabled={submitting}
                                className='w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black tracking-[0.2em] text-[11px] uppercase hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-60'
                            >
                                {submitting ? 'Transferring...' : 'Send Submission'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
