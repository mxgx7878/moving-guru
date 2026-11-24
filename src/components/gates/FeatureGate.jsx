import { PageLoader } from '../feedback';
import AccessCheckError from './AccessCheckError';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { FEATURE_LABELS } from './SubscriptionGate';
const getFeatureMeta = (key) => ({ label: FEATURE_LABELS[key] || 'This feature' });
import { ROLE_THEME } from '../../config/portalConfig';

export default function FeatureGate({ feature, children, inline = false }) {
  const { allowed, loading, error, retry } = useFeatureGate(feature);

  if (loading) return <PageLoader />;
  if (error) return <AccessCheckError onRetry={retry} />;
  if (allowed) return children;

  return inline
    ? <InlineGate featureKey={feature} />
    : <PageGate featureKey={feature} />;
}

function PageGate({ featureKey }) {
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const role      = user?.role || 'instructor';
  const theme     = ROLE_THEME[role] || ROLE_THEME.instructor;
  const meta      = getFeatureMeta(featureKey);
  const subPath   = role === 'studio' ? '/studio/subscription' : '/portal/subscription';

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center text-center space-y-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ backgroundColor: `${theme.accent}18` }}
      >
        <Lock size={32} style={{ color: '#3D5E16' }} />
      </div>

      <div className="space-y-2">
        <h2 className="font-unbounded text-xl font-black text-[#3E3D38]">
          {meta?.label ?? 'Feature'} requires an upgrade
        </h2>
        <p className="text-ink-muted text-sm max-w-sm">
          {meta?.description
            ? `${meta.description} is not included in your current plan.`
            : 'This feature is not included in your current plan.'}
          {' '}Upgrade to unlock it.
        </p>
      </div>

      <button
        onClick={() => navigate(subPath)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-ink transition-opacity hover:opacity-90"
        style={{ backgroundColor: theme.accent }}
      >
        <Sparkles size={14} />
        View plans & upgrade
      </button>
    </div>
  );
}

function InlineGate({ featureKey }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const role     = user?.role || 'instructor';
  const theme    = ROLE_THEME[role] || ROLE_THEME.instructor;
  const meta     = getFeatureMeta(featureKey);
  const subPath  = role === 'studio' ? '/studio/subscription' : '/portal/subscription';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E0D8] bg-[#FFFFFF]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${theme.accent}18` }}
      >
        <Lock size={14} style={{ color: '#3D5E16' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#3E3D38]">
          {meta?.label ?? 'Feature'} locked
        </p>
        <p className="text-[10px] text-ink-muted">Not included in your plan</p>
      </div>
      <button
        onClick={() => navigate(subPath)}
        className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-ink whitespace-nowrap"
        style={{ backgroundColor: theme.accent }}
      >
        Upgrade
      </button>
    </div>
  );
}
