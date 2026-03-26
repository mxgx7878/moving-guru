import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import {
  LayoutDashboard, User, CreditCard, Star, LogOut,
  Globe, ChevronRight, Bell, MessageCircle
} from 'lucide-react';

const NAV = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/profile', icon: User, label: 'My Profile' },
  { to: '/portal/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/portal/subscription', icon: Star, label: 'Subscription' },
  { to: '/portal/payments', icon: CreditCard, label: 'Payment History' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate('/login'));
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
        fixed top-0 left-0 h-full w-64 bg-[#FDFCF8] z-40 flex flex-col
        border-r border-[#E5E0D8]
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#E5E0D8]">
          <a href="/" className="flex items-center gap-2">
            <Globe size={18} className="text-[#CE4F56]" />
            <span className="font-['Unbounded'] text-sm font-bold text-[#3E3D38] tracking-wider">
              MOVING <em className="not-italic text-[#CE4F56]">GURU</em>
            </span>
          </a>
          <p className="text-[10px] text-[#9A9A94] mt-1 tracking-widest uppercase">Member Portal</p>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-3 bg-[#f5fca6]/30 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white font-bold text-xs font-['Unbounded'] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[#3E3D38] text-xs font-semibold truncate">{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.profileStatus === 'active' ? 'bg-[#6BE6A4]' : 'bg-[#9A9A94]'}`} />
                <p className="text-[#9A9A94] text-[10px] capitalize">{user?.profileStatus || 'inactive'}</p>
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
                  ? 'bg-[#CE4F56] text-white'
                  : 'text-[#6B6B66] hover:bg-[#EDE8DF] hover:text-[#3E3D38]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[#9A9A94] group-hover:text-[#6B6B66]'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={12} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#E5E0D8] space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9A9A94] hover:bg-red-50 hover:text-red-500 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
