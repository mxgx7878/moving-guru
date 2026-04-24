import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/actions/authAction';
import { LogOut, ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.png';
import { NAV_CONFIG, ROLE_THEME } from '../../config/portalConfig';
import Avatar from '../ui/Avatar';

export default function Sidebar({ mobileOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.instructor;

  // Display name: studios show studio_name, others show name
  const displayName = role === 'studio'
    ? (user?.studio_name || user?.studioName || user?.name || 'Studio')
    : (user?.name || 'Member');

  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate('/login'));
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
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
          <a href="/" className="flex items-center gap-1">
            <img src={logo} alt="Moving Guru" height={52} width={52} />
            <span className="font-unbounded text-sm font-bold text-[#3E3D38] tracking-wider">
              MOVING{' '}
              <em className="not-italic" style={{ color: theme.accent }}>GURU</em>
            </span>
          </a>
          <p className="text-[10px] text-[#9A9A94] mt-1 tracking-widest uppercase">{theme.label}</p>
        </div>

        {/* User / Studio card */}
        <Link to={theme.profilePath} className="px-4 py-4 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-3 bg-[#f5fca6]/25 rounded-xl p-3">
            <Avatar
              name={displayName}
              src={user?.profile_picture_url || user?.profile_picture}
              size="sm"
              tone={theme.avatarTone}
            />
            <div className="min-w-0">
              <p className="text-[#3E3D38] text-xs font-semibold truncate">{displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6BE6A4]" />
                <p className="text-[#9A9A94] text-[10px] capitalize">{role}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive
                  ? 'bg-[#3E3D38] text-white'
                  : 'text-[#6B6B66] hover:bg-[#FBF8E4] hover:text-[#3E3D38]'}`
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

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#E5E0D8]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9A9A94] hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}