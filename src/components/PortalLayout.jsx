import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-['DM_Sans']">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-black/8 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <Menu size={20} className="text-black/60" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors relative">
              <Bell size={18} className="text-black/50" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#e8834a] rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-black/40 hidden sm:inline">Hi,</span>
              <span className="font-semibold text-black/80">{user?.name?.split(' ')[0]}</span>
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
