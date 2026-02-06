import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { CheckCircle, Clock, FileText, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../hooks/useAssignments';

const statusStyles = {
    graded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100'
};

const StatusPill = ({ status }) => (
    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusStyles[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        {status}
    </span>
);

const formatDate = (date) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AssignmentSubmissions = () => {
    const { user } = useAuth();
    const { fetchTeacherSubmissions, gradeSubmission } = useAssignments();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const loadSubmissions = async () => {
            if (!user?.empId) return;
            setLoading(true);
            setError(null);

            try {
                const data = await fetchTeacherSubmissions(user.empId);
                setSubmissions(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSubmissions();
    }, [fetchTeacherSubmissions, user?.empId]);

    const normalized = useMemo(() => {
        return submissions.map((s) => {
            const hasGrade = s?.gradedAt || s?.marks !== null && s?.marks !== undefined;
            return {
                ...s,
                status: hasGrade ? 'graded' : 'pending',
                studentName: s?.student?.name || s?.studentName || 'Student',
                studentRollNo: s?.student?.rollNo || s?.studentRollNo || '—',
                courseCode: s?.course?.courseCode || '—',
                courseName: s?.course?.courseName || 'Course',
                assignmentTitle: s?.assignmentTitle || 'Assignment'
            };
        });
    }, [submissions]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return normalized.filter((s) => {
            if (filter !== 'all' && s.status !== filter) return false;
            if (!q) return true;
            return [
                s.studentName,
                s.studentRollNo,
                s.assignmentTitle,
                s.courseCode,
                s.courseName
            ].some((value) => String(value || '').toLowerCase().includes(q));
        });
    }, [normalized, search, filter]);

    const handleOpenGrade = (submission) => {
        setFeedback(null);
        setSelected(submission);
        setGradeForm({
            marks: submission?.marks ?? '',
            feedback: submission?.feedback || ''
        });
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!selected) return;

        setSaving(true);
        setFeedback(null);
        try {
            const payload = {
                assignmentId: selected.assignmentId,
                submissionId: selected.submissionId,
                marks: gradeForm.marks,
                feedback: gradeForm.feedback,
                teacherEmpId: user?.empId
            };

            const response = await gradeSubmission(payload);
            const updated = response?.submission;

            setSubmissions((prev) => prev.map((item) => (
                item.submissionId === updated.submissionId
                    ? { ...item, ...updated, gradedAt: updated.gradedAt }
                    : item
            )));

            setFeedback({ type: 'success', text: response?.message || 'Submission graded successfully' });
            setSelected(null);
        } catch (err) {
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
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
        <div className="py-8 space-y-8">
            <PageHeader
                title="Assignment Submissions"
                subtitle="Review student submissions and record grades."
            />

            {feedback && (
                <div className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border animate-fadeIn ${feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {feedback.text}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-xs font-bold text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50 lg:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Search & Filter
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="relative w-full md:w-[420px]">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by student, course, or assignment..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-100 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-200"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['all', 'pending', 'graded'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === s
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Summary
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Pending
                            </p>
                            <p className="text-xl font-black text-amber-600 mt-2">
                                {normalized.filter((s) => s.status === 'pending').length}
                            </p>
                        </div>
                        <div className="border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Graded
                            </p>
                            <p className="text-xl font-black text-emerald-600 mt-2">
                                {normalized.filter((s) => s.status === 'graded').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Submissions
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {filtered.length} submissions
                        </p>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                        {normalized.length} Total
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignment</th>
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted</th>
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {filtered.map((submission) => (
                                <tr key={submission.submissionId}>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-900">{submission.studentName}</p>
                                        <p className="text-xs text-slate-500">{submission.studentRollNo}</p>
                                    </td>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-900">{submission.assignmentTitle}</p>
                                        {submission.fileUrl ? (
                                            <a
                                                href={submission.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                                            >
                                                <FileText size={12} />
                                                Open file
                                            </a>
                                        ) : (
                                            <p className="text-xs text-slate-400">No file URL</p>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-900">{submission.courseCode}</p>
                                        <p className="text-xs text-slate-500">{submission.courseName}</p>
                                    </td>
                                    <td className="py-4 text-slate-600 font-semibold">
                                        {formatDate(submission.submittedAt)}
                                    </td>
                                    <td className="py-4">
                                        <StatusPill status={submission.status} />
                                    </td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => handleOpenGrade(submission)}
                                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                                        >
                                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-xl w-full p-8 border border-white/20">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                                    {selected.courseCode}
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Grade Submission</h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {selected.assignmentTitle} • {selected.studentName}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleGradeSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Marks</label>
                                    <input
                                        type="number"
                                        value={gradeForm.marks}
                                        onChange={(e) => setGradeForm((prev) => ({ ...prev, marks: e.target.value }))}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all"
                                        placeholder="e.g., 18"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                                    <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-2">
                                        {selected.status === 'graded' ? <CheckCircle size={16} className="text-emerald-600" /> : <Clock size={16} className="text-amber-500" />}
                                        {selected.status}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Feedback</label>
                                <textarea
                                    value={gradeForm.feedback}
                                    onChange={(e) => setGradeForm((prev) => ({ ...prev, feedback: e.target.value }))}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all min-h-[120px]"
                                    placeholder="Share feedback for the student..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-60"
                            >
                                {saving ? 'SAVING...' : 'SAVE GRADE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentSubmissions;
