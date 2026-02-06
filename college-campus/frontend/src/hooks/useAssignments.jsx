import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAssignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const rollNo = user?.rollNo;
            const studentEndpoint = `/api/assignments/student/${rollNo}`;
            const fallbackEndpoint = '/api/assignments/submissions';
            
            console.log('Fetching assignments. User:', user);
            
            let response;
            let endpoint = studentEndpoint;
            
            // Try student-specific endpoint first if rollNo exists
            if (rollNo) {
                console.log('Trying student-specific endpoint:', studentEndpoint);
                response = await fetch(studentEndpoint);
                
                // If student-specific endpoint fails (404, etc), try fallback
                if (!response.ok && response.status === 404) {
                    console.log('Student endpoint not found, trying fallback:', fallbackEndpoint);
                    response = await fetch(fallbackEndpoint);
                    endpoint = fallbackEndpoint;
                }
            } else {
                console.log('No rollNo found, using fallback endpoint:', fallbackEndpoint);
                response = await fetch(fallbackEndpoint);
                endpoint = fallbackEndpoint;
            }
            
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;
            
            console.log('Assignments response from', endpoint, ':', { status: response.status, data });
            
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to fetch assignments');
            }
            const list = Array.isArray(data) ? data : data?.assignments || [];
            console.log('Processed assignments:', list);
            setAssignments(list);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError(err.message);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }, [user?.rollNo]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const submitAssignment = useCallback(async ({ assignmentId, courseCode, rollNo, fileUrl }) => {
        const payload = { 
            assignmentId,
            courseCode, 
            rollNo: rollNo || user?.rollNo,
            fileUrl 
        };
        
        console.log('📤 Submitting assignment with payload:', payload);

        const response = await fetch('/api/assignments/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        const fallbackText = !isJson ? await response.text() : '';
        
        console.log('📥 Submission response:', { status: response.status, data });

        if (!response.ok) {
            const message = data?.message || fallbackText || `Assignment submission failed (status ${response.status})`;
            throw new Error(message);
        }

        console.log('🔄 Refreshing assignments after submission...');
        await fetchAssignments();
        console.log('✅ Assignments refreshed after submission');
        return data;
    }, [fetchAssignments, user?.rollNo]);

    const fetchSubmissionById = useCallback(async (id) => {
        if (!id) return null;
        const response = await fetch(`/api/assignments/submissions/${id}`);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            throw new Error(data?.message || 'Failed to fetch submission');
        }

        return data;
    }, []);

    const createAssignment = useCallback(async ({ title, description, dueDate, courseCode, teacherEmpId }) => {
        const payload = { title, description, dueDate, courseCode, teacherEmpId };

        // Basic client-side guardrails to avoid empty payloads that the API will reject.
        if (!payload.title || !payload.description || !payload.courseCode || !payload.teacherEmpId) {
            throw new Error('Title, description, course code, and teacher employee ID are required');
        }

        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        const fallbackText = !isJson ? await response.text() : '';

        if (!response.ok) {
            const message = data?.message || fallbackText || `Failed to create assignment (status ${response.status})`;
            throw new Error(message);
        }

        await fetchAssignments();
        return data;
    }, [fetchAssignments]);

    const fetchTeacherSubmissions = useCallback(async (teacherEmpId) => {
        if (!teacherEmpId) return [];
        const response = await fetch(`/api/assignments/teacher/${teacherEmpId}/submissions`);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            throw new Error(data?.message || 'Failed to fetch teacher submissions');
        }

        return data?.submissions || data || [];
    }, []);

    const gradeSubmission = useCallback(async ({ assignmentId, submissionId, marks, feedback, teacherEmpId }) => {
        if (!assignmentId || !submissionId) {
            throw new Error('Assignment ID and submission ID are required');
        }

        const payload = { marks, feedback, teacherEmpId };
        const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        const fallbackText = !isJson ? await response.text() : '';

        if (!response.ok) {
            const message = data?.message || fallbackText || `Failed to grade submission (status ${response.status})`;
            throw new Error(message);
        }

        return data;
    }, []);

    return {
        assignments,
        loading,
        error,
        refresh: fetchAssignments,
        submitAssignment,
        fetchSubmissionById,
        createAssignment,
        fetchTeacherSubmissions,
        gradeSubmission
    };
};
