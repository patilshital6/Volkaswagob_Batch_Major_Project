import React, { useMemo, useState, useEffect } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { useTeacherCourses } from "../../hooks/useTeacherCourses";
import { useStudents } from "../../hooks/useStudents";

const ClassList = () => {
  
  const { courses, loading: coursesLoading, error: coursesError } =
    useTeacherCourses();

  
  const {
    studentMap,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [search, setSearch] = useState("");

  //state: { studentId: "Present" | "Absent" }
  const [attendance, setAttendance] = useState({});

  //Select first course automatically
  useEffect(() => {
    if (!selectedCourseId && courses?.length > 0) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(() => {
    if (!courses?.length) return null;
    return courses.find((c) => c._id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  //Enrolled student IDs
  const studentIds = selectedCourse?.students || [];

  //Filter students by search text (roll no / name / id)
  const filteredStudentIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentIds;

    return studentIds.filter((id) => {
      const s = studentMap.get(id);
      const roll = (s?.rollNo || "").toLowerCase();
      const name = (s?.name || "").toLowerCase();
      const mongoId = String(id).toLowerCase();

      return roll.includes(q) || name.includes(q) || mongoId.includes(q);
    });
  }, [studentIds, search, studentMap]);

  //Setting status
  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const presentCount = Object.values(attendance).filter(
    (v) => v === "Present"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (v) => v === "Absent"
  ).length;

  //Save button (UI only for now)
  const handleSave = () => {
    const payload = {
      courseId: selectedCourse?._id,
      date: new Date().toISOString(),
      attendance,
    };

    console.log("Attendance payload:", payload);

    alert(
      "Attendance saved (UI only). Backend POST endpoint will be added later ✅"
    );
  };

  //Loading state
  if (coursesLoading) {
    return (
      <div className="py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  //Error state
  if (coursesError) {
    return (
      <div className="py-8">
        <PageHeader title="Class List" subtitle="Couldn't load courses" />
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
          <p className="text-red-600 font-bold text-sm">{coursesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <PageHeader
        title="Class List"
        subtitle="Select a course and see the students in the class."
        right={
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            Save Attendance
          </button>
        }
      />

      {/* Top Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Course Select + Search */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50 lg:col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Select Course
          </p>

          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full md:w-[420px] px-4 py-3 rounded-2xl bg-white border border-slate-100 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-200"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} • {c.courseName}
                </option>
              ))}
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roll no / name..."
              className="w-full md:w-[320px] px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-200/50 text-sm outline-none focus:border-indigo-200"
            />
          </div>

          <div className="mt-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-900">Selected:</span>{" "}
              {selectedCourse?.courseCode} • {selectedCourse?.courseName} •{" "}
              <span className="font-bold">{studentIds.length}</span> students
            </p>
          </div>

          {/* Student fetch note */}
          {studentsLoading && (
            <p className="text-sm text-slate-500 mt-4">
              Loading student details...
            </p>
          )}

          {studentsError && (
            <p className="text-sm text-red-600 font-bold mt-4">
              {studentsError}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Class List Summary
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Present
              </p>
              <p className="text-xl font-black text-indigo-600 mt-2">
                {presentCount}
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Absent
              </p>
              <p className="text-xl font-black text-slate-900 mt-2">
                {absentCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Students ({filteredStudentIds.length})
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Roll No
                </th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Student Name
                </th>
                <th className="py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredStudentIds.map((studentId) => {
                const s = studentMap.get(studentId);

                return (
                  <tr key={studentId}>
                    <td className="py-4 font-bold text-slate-900">
                      {s?.rollNo || "—"}
                    </td>

                    <td className="py-4">
                      <p className="font-bold text-slate-900">
                        {s?.name || "Unknown Student"}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID: {String(studentId).slice(0, 12)}...
                      </p>
                    </td>

                    <td className="py-4 text-right">
                      <div className="inline-flex bg-slate-50 border border-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => setStatus(studentId, "Present")}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                            attendance[studentId] === "Present"
                              ? "bg-indigo-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setStatus(studentId, "Absent")}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                            attendance[studentId] === "Absent"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudentIds.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-500">
                    No students found for this course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassList;