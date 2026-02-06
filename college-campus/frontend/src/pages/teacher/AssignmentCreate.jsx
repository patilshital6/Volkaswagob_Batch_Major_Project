import { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { useAssignments } from '../../hooks/useAssignments';
import { useAuth } from '../../context/AuthContext';

const TeacherAssignmentCreate = () => {
    const { user } = useAuth();
    const { createAssignment } = useAssignments();
    const [form, setForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        courseCode: '',
        teacherEmpId: user?.empId || '',
    });

    useEffect(() => {
        if (user?.empId) {
            setForm(prev => ({ ...prev, teacherEmpId: user.empId }));
        }
    }, [user]);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback(null);

        try {
            const dueDateIso = form.dueDate ? new Date(form.dueDate).toISOString() : '';
            const response = await createAssignment({
                title: form.title.trim(),
                description: form.description.trim(),
                dueDate: dueDateIso,
                courseCode: form.courseCode.trim(),
                teacherEmpId: form.teacherEmpId.trim(),
            });

            setFeedback({ type: 'success', text: response?.message || 'Assignment created successfully' });
            setForm({ title: '', description: '', dueDate: '', courseCode: '', teacherEmpId: '' });
        } catch (err) {
            console.error('Error creating assignment:', err);
            setFeedback({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='py-8'>
            <PageHeader title='Create Assignment' subtitle='Publish a new assignment for your course.' />

            <div className='max-w-3xl mx-auto px-4'>
                {feedback && (
                    <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {feedback.text}
                    </div>
                )}

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Title</label>
                            <input
                                type='text'
                                value={form.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all'
                                placeholder='Mini project as home assignment'
                            />
                        </div>

                        <div>
                            <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all min-h-[120px]'
                                placeholder='Implement basic concepts of HTML, CSS, and JS.'
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Due Date</label>
                                <input
                                    type='datetime-local'
                                    value={form.dueDate}
                                    onChange={(e) => handleChange('dueDate', e.target.value)}
                                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all'
                                />
                            </div>
                            <div>
                                <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>Course Code</label>
                                <input
                                    type='text'
                                    value={form.courseCode}
                                    onChange={(e) => handleChange('courseCode', e.target.value)}
                                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 transition-all'
                                    placeholder='CSE103'
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={submitting}
                            className='w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4'
                        >
                            {submitting ? 'PUBLISHING...' : 'PUBLISH ASSIGNMENT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeacherAssignmentCreate;
