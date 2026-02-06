import React, { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useCourseList } from "../hooks/useCourseList";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * CourseRegistration Component
 * Merges backend course enrollment data with the standard registration interface.
 */
const CourseRegistration = () => {
    const { user } = useAuth();
    const { courses: backendCourses, loading: coursesLoading, error: coursesError } = useCourseList();
    const [isRegistrationOpen] = useState(false);

    // Fallback local course data
    const [availableCourses, setAvailableCourses] = useState([
        { id: "c1", code: "CSE301", title: "Database Systems", faculty: "Dr. Mehta", credits: 4, slot: "A1", category: "Core" },
        { id: "c2", code: "CSE302", title: "Computer Networks", faculty: "Dr. Rao", credits: 3, slot: "B1", category: "Core" },
        { id: "c3", code: "CSE304", title: "Machine Learning", faculty: "Dr. Gupta", credits: 3, slot: "D1", category: "Elective" },
        { id: "c4", code: "CSE305", title: "Software Engineering", faculty: "Dr. Sharma", credits: 3, slot: "E1", category: "Core" },
    ]);

    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [query, setQuery] = useState("");

    // Sync backend courses with local state
    React.useEffect(() => {
        if (backendCourses && backendCourses.length > 0) {
            const mapped = backendCourses.map(c => ({
                id: c._id || Math.random().toString(),
                code: c.courseCode,
                title: c.courseName,
                faculty: "Registered Faculty",
                credits: c.credits,
                slot: "N/A",
                category: c.department || "Core"
            }));

            setRegisteredCourses(prev => {
                const combined = [...mapped, ...prev];
                const unique = Array.from(new Map(combined.map(item => [item.code, item])).values());
                return unique;
            });
        }
    }, [backendCourses]);

    const filteredAvailable = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return availableCourses;

        return availableCourses.filter((c) => {
            return (
                c.code.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q) ||
                c.faculty.toLowerCase().includes(q) ||
                c.slot.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
            );
        });
    }, [query, availableCourses]);

    const handleRegister = (course) => {
        if (!isRegistrationOpen) return;
        setAvailableCourses((prev) => prev.filter((c) => c.id !== course.id));
        setRegisteredCourses((prev) => [course, ...prev]);
    };

    const handleDrop = (course) => {
        if (!isRegistrationOpen) return;
        setRegisteredCourses((prev) => prev.filter((c) => c.id !== course.id));
        setAvailableCourses((prev) => [...prev, course]);
    };

    return (
        <div className="py-8">
            <PageHeader
                title="Course Registration"
                subtitle="Search and register courses for the current academic semester."
                right={
                    <div className="w-full md:w-[340px]">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by code, faculty, slot..."
                            className="w-full px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-200/50 text-sm outline-none focus:border-indigo-200"
                        />
                    </div>
                }
            />

            {/* Error UI if sync fails */}
            {coursesError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-tight">Zeta Registry Sync Error: {coursesError}</p>
                    <button onClick={() => window.location.reload()} className="text-[10px] font-black text-red-700 underline uppercase tracking-widest">Retry</button>
                </div>
            )}

            {/* Registration Status Banner */}
            <div className="mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Registration Status</p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-lg font-bold text-slate-900">
                            {isRegistrationOpen ? "Course Registration is Open" : "Course Registration is Closed"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {isRegistrationOpen
                                ? "You can register and drop courses during the active window."
                                : "The registration window has concluded. Please contact the Academic Office for changes."}
                        </p>
                    </div>
                    {!isRegistrationOpen && (
                        <div className="flex gap-3">
                            <button className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">Contact Admin</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Courses */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Courses</p>
                            <p className="text-sm text-slate-500 mt-1">Select a course to register.</p>
                        </div>
                        <Badge text={`${filteredAvailable.length} available`} />
                    </div>

                    <CourseTable
                        rows={filteredAvailable}
                        emptyText="No courses found."
                        actionLabel="Register"
                        actionStyle="primary"
                        disabled={!isRegistrationOpen}
                        onAction={handleRegister}
                    />
                </div>

                {/* Registered Courses */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50 relative overflow-hidden">
                    {coursesLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-600" size={24} />
                        </div>
                    )}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Courses</p>
                            <p className="text-sm text-slate-500 mt-1">Synced with Zeta Registry.</p>
                        </div>
                        <Badge
                            text={`${registeredCourses.length} registered`}
                            type="success"
                        />
                    </div>

                    <CourseTable
                        rows={registeredCourses}
                        emptyText="No registered courses yet."
                        actionLabel="Drop"
                        actionStyle="danger"
                        disabled={!isRegistrationOpen}
                        onAction={handleDrop}
                    />
                </div>
            </div>

            <div className="mt-8 bg-slate-50 border border-slate-100 rounded-3xl p-6">
                <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-900">Zeta Registry Sync:</span> This list includes courses automatically assigned based on your program and those you've manually selected. Manual changes are only allowed during the active registration window.
                </p>
            </div>
        </div>
    );
};

function Badge({ text, type = "default" }) {
    const styles = type === "success"
        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
        : "bg-slate-50 text-slate-700 border-slate-100";

    return (
        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${styles}`}>
            {text}
        </span>
    );
}

function CourseTable({ rows, emptyText, actionLabel, actionStyle, disabled, onAction }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Code</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credits</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slot</th>
                        <th className="py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-50 text-sm">
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((c) => (
                            <tr key={c.id} className="group/row">
                                <td className="py-4 font-mono font-bold text-slate-900 text-xs">{c.code}</td>
                                <td className="py-4">
                                    <p className="font-bold text-slate-900 leading-tight">{c.title}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">{c.faculty} • {c.category}</p>
                                </td>
                                <td className="py-4 text-slate-600 font-medium">{c.credits}</td>
                                <td className="py-4">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 border border-slate-200 text-slate-600">
                                        {c.slot}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <button
                                        onClick={() => onAction(c)}
                                        disabled={disabled}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${disabled
                                            ? "bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                                            : actionStyle === "danger"
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-200"
                                            }`}
                                    >
                                        {actionLabel}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CourseRegistration;
