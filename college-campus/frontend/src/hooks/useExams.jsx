import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useExams = () => {
    const { user } = useAuth();
    const [allExams, setAllExams] = useState([]);
    const [studentCourses, setStudentCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch both exams and student's courses
                const [examsResponse, coursesResponse] = await Promise.all([
                    fetch('/api/exams'),
                    user?.rollNo ? fetch(`/api/courses/${user.rollNo}`) : Promise.resolve({ ok: false })
                ]);

                if (!examsResponse.ok) throw new Error('Failed to fetch exams');
                
                const examsData = await examsResponse.json();
                setAllExams(examsData);

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    const courses = coursesData.courses || (Array.isArray(coursesData) ? coursesData : []);
                    setStudentCourses(courses);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.rollNo]);

    // Create a map of courseCode to courseName for quick lookup
    const courseMap = {};
    studentCourses.forEach(course => {
        courseMap[course.courseCode] = course.courseName;
    });

    // Get course codes that the student is registered for
    const studentCourseCodes = studentCourses.map(course => course.courseCode);

    // Filter exams and enrich with course names
    const studentExams = allExams
        .filter(exam =>
            exam.course?.students?.includes(user?.id) || 
            studentCourseCodes.includes(exam.courseCode)
        )
        .map(exam => ({
            ...exam,
            // Use examName, or fallback to courseName from course object or courseMap
            courseName: exam.examName || exam.courseName || exam.course?.courseName || courseMap[exam.courseCode] || exam.courseCode
        }))
        .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    const getNextExam = () => {
        const futureExams = studentExams.filter(exam => new Date(exam.examDate) >= new Date().setHours(0, 0, 0, 0));
        return futureExams.length > 0 ? futureExams[0] : null;
    };

    return {
        exams: studentExams,
        allExams,
        loading,
        error,
        getNextExam
    };
};
