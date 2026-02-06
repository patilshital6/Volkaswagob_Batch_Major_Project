import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Home from '../pages/Home';
import FacultyHome from '../pages/FacultyHome';
import Login from '../pages/Login';
import Attendance from '../pages/Attendance';
import Timetable from '../pages/Timetable';
import Grades from '../pages/Grades';
import Assignments from '../pages/Assignments';
import Fees from '../pages/Fees';
import Events from '../pages/Events';
import Calendar from '../pages/Calendar';
import Support from '../pages/Support';
import Signup from '../pages/Signup';
import SignupTeacher from '../pages/SignupTeacher';
import CourseRegistration from '../pages/CourseRegistration';
import Profile from '../pages/Profile';
import Exams from '../pages/Exams';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Help from '../pages/Help';
import Contact from '../pages/Contact';
import TeacherAssignmentCreate from '../pages/teacher/AssignmentCreate';
import TeacherAssignmentSubmissions from '../pages/teacher/AssignmentSubmissions';
import { useAuth } from '../context/AuthContext';
import ClassList from '../pages/teacher/classList';
import CourseAllocation from '../pages/teacher/CourseAllocation'
import AdminHome from '../pages/admin/AdminHome';
import CourseCreate from '../pages/admin/CourseCreate';
import AllCourses from '../pages/admin/AllCourses';
import ApplyLeaves from '../pages/teacher/ApplyLeaveForm';
import ApproveLeaves from '../pages/admin/AproveLeaves';
import TeacherLeaves from '../pages/teacher/TeacherLeaves';
import TicketRendering from '../pages/admin/TicketRendering';
import ExamCreate from '../pages/admin/ExamCreate';
import LCManagement from '../pages/admin/LCManagement';
import ApplyLC from '../pages/ApplyLC';
import CertificateView from '../pages/CertificateView';

const AppRoutes = () => {
    const { user } = useAuth();

    // Protected Route component
    const ProtectedRoute = ({ children }) => {
        if (!user) return <Navigate to="/login" replace />;
        return children;
    };

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
            <Route path="/signup-teacher" element={!user ? <SignupTeacher /> : <Navigate to="/" replace />} />

            {/* Direct access to printable certificate for all roles once issued */}
            <Route path="/certificate/:id" element={<ProtectedRoute><CertificateView /></ProtectedRoute>} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                {/* Index page changes based on role */}
                <Route index element={
                    user?.role === 'admin' ? <AdminHome /> :
                        user?.role === 'teacher' ? <FacultyHome /> :
                            <Home />
                } />

                {/* Universal Routes (All Roles) */}
                <Route path="profile" element={<Profile />} />
                <Route path="support" element={<Support />} />
                <Route path="events" element={<Events />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="help" element={<Help />} />
                <Route path="contact" element={<Contact />} />

                {/* Student Only Routes */}
                {user?.role === 'student' && (
                    <>
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="timetable" element={<Timetable />} />
                        <Route path="grades" element={<Grades />} />
                        <Route path="assignments" element={<Assignments />} />
                        <Route path="fees" element={<Fees />} />
                        <Route path="registration" element={<CourseRegistration />} />
                        <Route path="exams" element={<Exams />} />
                        <Route path="apply-lc" element={<ApplyLC />} />
                    </>
                )}

                {/* Faculty Only Routes */}
                {user?.role === 'teacher' && (
                    <>
                        <Route path="teacher/assignments/new" element={<TeacherAssignmentCreate />} />
                        <Route path="teacher/assignments/submissions" element={<TeacherAssignmentSubmissions />} />
                        <Route path="teacher/classlist" element={<ClassList />} />
                        <Route path="teacher/allotcourse" element={<CourseAllocation />} />
                        <Route path="teacher/leaves" element={<TeacherLeaves />} />
                    </>
                )}

                {/* Admin Only Routes */}
                {user?.role === 'admin' && (
                    <>
                        <Route path="admin" element={<AdminHome />} />
                        <Route path="admin/course-create" element={<CourseCreate />} />
                        <Route path="admin/all-courses" element={<AllCourses />} />
                        <Route path="admin/exam-create" element={<ExamCreate />} />
                        <Route path="admin/approveleaves" element={<ApproveLeaves />} />
                        <Route path="admin/tickets" element={<TicketRendering />} />
                        <Route path="admin/lc-management" element={<LCManagement />} />
                    </>
                )}

                {/* Catch-all */}
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">404 - Page Not Found</h2>
                        <p className="text-slate-500 mt-2">The module you are looking for doesn't exist yet.</p>
                    </div>
                } />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
