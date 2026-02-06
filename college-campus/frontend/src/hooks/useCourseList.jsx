import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useCourseList = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchCourses = async () => {
            if (!user?.rollNo) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null); // Clear previous errors

                const response = await fetch(`/api/courses/${user.rollNo}`);

                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status}. Please try again later.`);
                }

                const data = await response.json();

                if (isMounted) {
                    const courseData = data.courses || (Array.isArray(data) ? data : []);
                    setCourses(courseData);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Course fetch failed:', err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCourses();

        return () => {
            isMounted = false;
        };
    }, [user?.rollNo]);

    return { courses, loading, error };
};
