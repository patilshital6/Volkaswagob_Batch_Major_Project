import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Building2, Calendar, MapPin, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const Registration = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    currentYear: '1',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await registerStudent(formData);
      setSuccessData(result);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-500 rounded-3xl mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Registration Successful!</h1>
          <p className="text-slate-500 text-sm mb-10">Welcome to Zeta University, {formData.name}. Please note your Roll Number for login.</p>

          <div className="bg-slate-900 rounded-3xl p-8 mb-10">
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-2">Student Roll Number</p>
            <p className="text-4xl font-black text-white tracking-widest">{successData.rollNo}</p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
          >
            PROCEED TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-10 text-center relative">
          <div className="flex justify-between items-center absolute top-6 left-6 right-6">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Back to Login</Link>
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl mb-6 shadow-xl shadow-white/10">
            <GraduationCap className="text-slate-900" size={28} />
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight uppercase">Student Registration</h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">Zeta University</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@zeta.edu"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Select Dept</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil Engineering</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Year</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <select
                    name="currentYear"
                    required
                    value={formData.currentYear}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Address (Optional)</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Already have an account?{" "}
              <Link to="/login" className="text-slate-900 hover:text-indigo-600 transition-colors">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
