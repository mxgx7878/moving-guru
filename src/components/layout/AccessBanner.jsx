import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, Sparkles, XCircle, ArrowRight } from 'lucide-react';
import { getAccessState } from '../../utils/approvalUtils';
import { ROLE_THEME } from '../../config/portalConfig';

// Marquee-style banner pinned to the top of PortalLayout. Renders only when
// the user needs to take action or wait on admin — never for approved users.
export default function AccessBanner() {
  const { user } = useSelector((s) => s.auth);
  const state = getAccessState(user);

  if (!user || state === 'approved' || state === 'unknown') return null;

  const profilePath = ROLE_THEME[user.role]?.defaultPath?.replace('/dashboard', '/profile')
                   || '/portal/profile';

  // Config per state — color, icon, message, optional CTA
  const cfg = {
    incomplete: {
      bg:     'bg-[#E89560]',
      text:   'text-white',
      icon:   AlertCircle,
      label:  'Complete your profile',
      body:   "Add the missing details so our team can review your account for platform access.",
      cta:    { to: profilePath, label: 'Go to profile' },
    },
    pending: {
      bg:     'bg-[#7F77DD]',
      text:   'text-white',
      icon:   Sparkles,
      label:  'Awaiting admin approval',
      body:   "Your profile is under review. You'll unlock all platform features once an admin approves your account.",
      cta:    null,
    },
    rejected: {
      bg:     'bg-red-500',
      text:   'text-white',
      icon:   XCircle,
      label:  'Registration not approved',
      body:   user.rejection_reason
        ? `Reason: ${user.rejection_reason}`
        : 'Your account could not be approved. Please contact support for more information.',
      cta:    null,
    },
    suspended: {
      bg:     'bg-red-600',
      text:   'text-white',
      icon:   XCircle,
      label:  'Account suspended',
      body:   user.suspension_reason
        ? `Reason: ${user.suspension_reason}`
        : 'Your account has been suspended. Please contact support.',
      cta:    null,
    },
  }[state];

  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <div className={`${cfg.bg} ${cfg.text} overflow-hidden`}>
      <div className="px-4 lg:px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <Icon size={16} className="flex-shrink-0" />

        {/* On small screens this becomes a simple message; on wider screens it animates */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="font-bold text-xs tracking-widest uppercase flex-shrink-0">
            {cfg.label}
          </span>
          <span className="hidden sm:inline text-xs opacity-90 truncate">{cfg.body}</span>
        </div>

        {cfg.cta && (
          <Link
            to={cfg.cta.to}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0"
          >
            {cfg.cta.label} <ArrowRight size={11} />
          </Link>
        )}
      </div>

      {/* Mobile-only body line */}
      <p className="sm:hidden px-4 pb-2 text-[11px] opacity-90">{cfg.body}</p>
    </div>
  );
}