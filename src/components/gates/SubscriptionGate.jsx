// src/components/gates/SubscriptionGate.jsx
//
// The locked-feature UI. Used by RequireFeature (route guard) and
// FeatureGate (inline component). Single component → single look.

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

import { ROLE_THEME } from '../../config/portalConfig';
import { Button } from '../../components/ui';

// Map of feature keys to friendly labels for the message.
// Lives here (not in featureConstants) because it's a UI-only concern.
const FEATURE_LABELS = {
  messaging:          'Messaging',
  job_applications:   'Job Applications',
  post_jobs:          'Job Posting',
  grow_posts:         'Grow Posts',
  profile_visibility: 'Profile Visibility',
  save_jobs:          'Saved Jobs',
  search_instructors: 'Instructor Search',
  favourites:         'Favourites',
  reviews:            'Reviews',
};

export default function SubscriptionGate({ featureKey }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { currentSubscription } = useSelector((s) => s.subscription);

  const role        = user?.role || 'instructor';
  const theme       = ROLE_THEME[role] || ROLE_THEME.instructor;
  const featureLabel = FEATURE_LABELS[featureKey] || 'This feature';
  const subPath     = role === 'studio' ? '/studio/subscription' : '/portal/subscription';
  const planName    = currentSubscription?.plan?.name;

  const message = currentSubscription
    ? `${featureLabel} is not included in your ${planName || 'current'} plan.`
    : `${featureLabel} requires an active subscription.`;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center text-center space-y-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ backgroundColor: `${theme.accent}18` }}
      >
        <Lock size={32} style={{ color: theme.accent }} />
      </div>

      <div className="space-y-2">
        <h2 className="font-unbounded text-xl font-black text-[#3E3D38]">
          Upgrade required
        </h2>
        <p className="text-[#9A9A94] text-sm max-w-sm">
          {message} Upgrade your plan to unlock it.
        </p>
      </div>

      <Button
        variant="primary"
        icon={Sparkles}
        onClick={() => navigate(subPath)}
        style={{ background: theme.accent }}
      >
        View plans & upgrade
      </Button>

      <button
        onClick={() => navigate(-1)}
        className="text-xs text-[#9A9A94] hover:text-[#3E3D38] transition-colors inline-flex items-center gap-1"
      >
        <ArrowRight size={11} className="rotate-180" />
        Go back
      </button>
    </div>
  );
}