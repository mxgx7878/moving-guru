import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, CreditCard, Star, LogOut,
  Globe, ChevronRight, Bell
} from 'lucide-react';

const NAV = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/profile', icon: User, label: 'My Profile' },
  { to: '/portal/subscription', icon: Star, label: 'Subscription' },
  { to: '/portal/payments', icon: CreditCard, label: 'Payment History' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'MG';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0f0f0f] z-40 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <a href="/" className="flex items-center gap-2">
            <Globe size={18} className="text-[#d4f53c]" />
            <span className="font-['Unbounded'] text-sm font-bold text-white tracking-wider">
              MOVING <em className="not-italic text-[#d4f53c]">GURU</em>
            </span>
          </a>
          <p className="text-[10px] text-white/40 mt-1 tracking-widest uppercase">Member Portal</p>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4f53c] to-[#e8834a] flex items-center justify-center text-[#0f0f0f] font-bold text-xs font-['Unbounded'] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.profileStatus === 'active' ? 'bg-[#d4f53c]' : 'bg-white/30'}`} />
                <p className="text-white/40 text-[10px] capitalize">{user?.profileStatus || 'inactive'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-[#d4f53c] text-[#0f0f0f]'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-[#0f0f0f]' : 'text-white/40 group-hover:text-white/70'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={12} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
