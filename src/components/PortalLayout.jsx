import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-['DM_Sans']">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E5E0D8] flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#EDE8DF] transition-colors"
          >
            <Menu size={20} className="text-[#6B6B66]" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-[#EDE8DF] transition-colors relative">
              <Bell size={18} className="text-[#6B6B66]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#CE4F56] rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9A9A94] hidden sm:inline">Hi,</span>
              <span className="font-semibold text-[#3E3D38]">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
