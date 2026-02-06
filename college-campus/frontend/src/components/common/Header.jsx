import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  // Get initials for profile circle
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '??';
  };

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 fixed top-0 inset-x-0 z-50">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800 transition-all"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-slate-900 font-bold text-sm">ZU</span>
          </div>
          <h1 className="text-sm font-bold tracking-[0.2em] hidden sm:block uppercase">ZETA UNIVERSITY</h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-slate-800 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold hover:ring-2 hover:ring-slate-700 transition-all uppercase"
          >
            {getInitials(user?.name)}
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{user?.role} Portal</p>
                </div>
                <div className="py-1">
                  {user?.role !== 'admin' && (
                    <Link
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 w-full text-left font-medium transition-colors"
                    >
                      <User size={14} className="text-slate-400" /> My Profile
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left font-medium border-t border-slate-100 mt-1 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
