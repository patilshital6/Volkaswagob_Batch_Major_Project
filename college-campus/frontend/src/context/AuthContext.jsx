import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('portal_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (email, password, role = 'student') => {
        try {
            // Development admin authentication
            if (role === 'admin' && email === 'admin@college.com' && password === 'admin123') {
                const adminData = {
                    id: 'admin-001',
                    rollNo: 'ADMIN',
                    role: 'admin',
                    name: 'System Administrator',
                    email: 'admin',
                    department: 'Management'
                };
                setUser(adminData);
                localStorage.setItem('portal_user', JSON.stringify(adminData));
                return adminData;
            }

            let endpoint = '/api/auth/login';
            if (role === 'teacher') endpoint = '/api/auth/login/teacher';
            if (role === 'admin') endpoint = '/api/auth/login/admin';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                throw new Error(data?.message || `Server Error: ${response.status}`);
            }

            const userData = {
                id: data.user?._id || data.userId,
                rollNo: data.user?.rollNo || '',
                empId: data.user?.empId || '',
                role: data.user?.role || data.role || role,
                name: data.user?.name || 'User',
                email: data.user?.email || email,
                department: data.user?.department || '',
                currentYear: data.user?.currentYear || '',
                courses: data.user?.courses || []
            };

            setUser(userData);
            localStorage.setItem('portal_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const registerStudent = async (studentData) => {
        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: studentData.name,
                    email: studentData.email,
                    password: studentData.password,
                    department: studentData.department,
                    currentYear: studentData.currentYear || '1',
                    address: studentData.address || ''
                })
            });

            const isJson = response.headers.get('content-type')?.includes('application/json');

            if (!response.ok) {
                const errorData = isJson ? await response.json() : null;
                throw new Error(errorData?.message || `Registration failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const registerTeacher = async (teacherData) => {
        try {
            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empId: teacherData.empId,
                    name: teacherData.name,
                    email: teacherData.email,
                    password: teacherData.password,
                    department: teacherData.department,
                    address: teacherData.address || ''
                })
            });

            const isJson = response.headers.get('content-type')?.includes('application/json');

            if (!response.ok) {
                const errorData = isJson ? await response.json() : null;
                throw new Error(errorData?.message || `Registration failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Teacher Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('portal_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerStudent, registerTeacher }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
