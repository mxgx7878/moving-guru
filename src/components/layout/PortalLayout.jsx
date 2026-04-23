import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import AccessBanner from './AccessBanner';
import { Avatar } from '../ui';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);

  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  const displayName = role === 'studio'
    ? (user?.studio_name || user?.studioName || user?.name || 'Studio')
    : (user?.name || 'Member');

  const firstName = displayName.split(' ')[0];

  return (
    <div className="flex h-screen bg-[#FBF8E4] font-['DM_Sans'] overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E5E0D8] flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#FBF8E4] transition-colors"
          >
            <Menu size={20} className="text-[#6B6B66]" />
          </button>

          {/* Role badge */}
          <span
            className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: theme.accent }}
          >
            {theme.label}
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-[#FBF8E4] transition-colors relative">
              <Bell size={18} className="text-[#6B6B66]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#CE4F56] rounded-full" />
            </button>
            <Link
              to={theme.profilePath}
              className="flex items-center gap-2 text-sm hover:bg-[#FBF8E4] rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
              title="View your profile"
            >
              <span className="text-[#9A9A94] hidden sm:inline">Hi,</span>
              <Avatar
                name={displayName}
                src={user?.profile_picture_url || user?.profile_picture}
                size="sm"
                tone={theme.avatarTone}
              />
              <span className="font-semibold text-[#3E3D38] hover:text-[#CE4F56]">{firstName}</span>
            </Link>
          </div>
        </header>

         <AccessBanner />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}