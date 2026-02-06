import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { profile: backendProfile, loading, error } = useProfile();

  const profile = {
    name: backendProfile?.name || user?.name || "",
    identifier: user?.role === 'teacher'
      ? (backendProfile?.empId || user?.empId || "FACULTY")
      : (backendProfile?.rollNo || user?.rollNo || ""),
    role: backendProfile?.role || user?.role || "Student",
    program: backendProfile?.program || (user?.role === 'teacher' ? "" : "B.Tech"),
    branch: backendProfile?.department || user?.department || "",
    year: backendProfile?.currentYear
      ? `${backendProfile.currentYear} Year`
      : (user?.role === 'teacher' ? "" : (user?.currentYear ? `${user.currentYear} Year` : "")),
    email: backendProfile?.email || user?.email || "",
    phone: backendProfile?.phone || "",
    dob: backendProfile?.dob || "",
    mentor: backendProfile?.mentor || "",
    address: backendProfile?.address || user?.address || "",
  };

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading && !backendProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Profile...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal and academic Zeta University record."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              {initials}
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-500 font-mono tracking-wider">
                <span className="text-[10px] font-black text-slate-300 mr-2 uppercase">{user?.role === 'teacher' ? 'Emp ID' : 'Roll No'}</span>
                {profile.identifier}
              </p>
              <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">
                {profile.role}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {profile.program && <InfoRow label="Program" value={profile.program} />}
            <InfoRow label="Branch" value={profile.branch} />
            {profile.year && <InfoRow label="Year" value={profile.year} />}
            {profile.mentor && <InfoRow label="Mentor" value={profile.mentor} />}
          </div>

          <button
            disabled
            className="mt-6 w-full px-5 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all opacity-60 cursor-not-allowed"
          >
            Edit Profile (Coming Soon)
          </button>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
            Contact & Personal Info
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniInfo label="Email" value={profile.email} />
            {/* <MiniInfo label="Phone" value={profile.phone} />
            <MiniInfo label="Date of Birth" value={profile.dob} />
            <MiniInfo
              label="Address"
              value={profile.address}
              className="md:col-span-2"
            />
            */}
          </div>

          {/* Footer strip */}
          <div className="mt-6 border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
            <p className="text-xs text-slate-500">
              Your profile information is securely linked to the Zeta University Academic Registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value, className = "" }) {
  return (
    <div className={`border border-slate-100 rounded-2xl p-4 ${className}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

export default Profile;
