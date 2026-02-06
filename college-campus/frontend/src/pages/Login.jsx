import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setRole('student')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${role === 'student' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setRole('teacher')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${role === 'teacher' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Faculty
                            </button>
                            <button
                                onClick={() => setRole('admin')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${role === 'admin' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl mb-6 shadow-xl shadow-white/10">
                        <GraduationCap className="text-slate-900" size={28} />
                    </div>
                    <h1 className="text-white text-2xl font-black tracking-tight uppercase">
                        {role === 'admin' ? "Admin Terminal" : role === 'teacher' ? "Faculty Portal" : "Student Portal"}
                    </h1>
                    <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">Zeta University</p>
                </div>

                <div className="p-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === 'admin' ? "Admin Email" : role === 'teacher' ? "Faculty Email" : "Student Email"}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "LOGIN"
                            )}
                        </button>
                    </form>

                    {role !== 'admin' && (
                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                {role === 'teacher' ? "New Faculty?" : "New Student?"}{" "}
                                <Link to={role === 'teacher' ? "/signup-teacher" : "/signup"} className="text-slate-900 hover:text-indigo-600 transition-colors">
                                    Register Here
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            </div>
        </div>
    );
};

export default Login;
