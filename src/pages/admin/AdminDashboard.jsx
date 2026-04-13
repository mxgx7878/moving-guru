import { useSelector } from 'react-redux';
import { Hammer } from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   Admin dashboard placeholder.
   Real shell will be built later — for now show an
   "Under Construction" notice so the route isn't blank.
   ──────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const adminName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center">
        <div className="w-14 h-14 bg-[#f5fca6] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Hammer size={24} className="text-[#3E3D38]" />
        </div>
        <p className="text-[#7F77DD] text-xs font-semibold tracking-widest uppercase mb-2">
          Admin Dashboard
        </p>
        <h1 className="font-['Unbounded'] text-2xl font-black text-[#3E3D38] mb-2">
          Hi {adminName} — Under Construction
        </h1>
        <p className="text-[#6B6B66] text-sm max-w-md mx-auto">
          The admin portal is being built. We'll add platform stats, user
          management, and moderation tools here soon.
        </p>
      </div>
    </div>
  );
}
