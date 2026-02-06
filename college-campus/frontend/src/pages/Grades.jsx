import React, { useMemo } from "react";
import PageHeader from "../components/layout/PageHeader";

const Grades = () => {
  // Later: replace with API response
  const cgpaData = {
    cgpa: 8.52,
    creditsEarned: 102,
    academicStatus: "Eligible for Placements",
    lastUpdated: "Jan 22, 2026",
    semesters: [
      { sem: 1, credits: 20, sgpa: 8.10, status: "Completed" },
      { sem: 2, credits: 22, sgpa: 8.40, status: "Completed" },
      { sem: 3, credits: 21, sgpa: 8.50, status: "Completed" },
      { sem: 4, credits: 20, sgpa: 8.70, status: "Completed" },
      { sem: 5, credits: 19, sgpa: 8.90, status: "Ongoing" },
    ],
  };

  const bestSemester = useMemo(() => {
    return cgpaData.semesters.reduce((best, cur) =>
      cur.sgpa > best.sgpa ? cur : best
    );
  }, [cgpaData.semesters]);

  return (
    <div className="py-8">
      <PageHeader
        title="CGPA"
        subtitle="View your CGPA summary and semester-wise SGPA performance."
      />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Overall CGPA"
          value={cgpaData.cgpa}
          helper={`Last updated: ${cgpaData.lastUpdated}`}
          highlight
        />
        <StatCard
          label="Credits Earned"
          value={cgpaData.creditsEarned}
          helper="Includes completed & eligible credits"
        />
        <StatCard
          label="Academic Status"
          value={cgpaData.academicStatus}
          helper={`Best SGPA: Sem ${bestSemester.sem} (${bestSemester.sgpa})`}
        />
      </div>

      {/* Semester-wise Table */}
      <div className="mt-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Semester Performance
            </p>
            <p className="text-sm text-slate-500 mt-1">
              A complete breakdown of your SGPA and semester status.
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            {cgpaData.semesters.length} Semesters
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Semester
                </th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Credits
                </th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  SGPA
                </th>
                <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 text-sm">
              {cgpaData.semesters.map((s) => (
                <tr key={s.sem}>
                  <td className="py-4 font-bold text-slate-900">
                    Semester {s.sem}
                  </td>
                  <td className="py-4 text-slate-600">{s.credits}</td>
                  <td className="py-4 font-bold text-slate-900">
                    {s.sgpa.toFixed(2)}
                  </td>
                  <td className="py-4">
                    <StatusPill status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, helper, highlight }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p
        className={`text-2xl font-bold ${highlight ? "text-indigo-600" : "text-slate-900"
          }`}
      >
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-2">{helper}</p>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const isCompleted = status === "Completed";

  return (
    <span
      className={`px-3 py-1 rounded-xl text-xs font-bold border ${isCompleted
        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
        : "bg-slate-50 text-slate-700 border-slate-100"
        }`}
    >
      {status}
    </span>
  );
};

export default Grades;
