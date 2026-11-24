import { useFeatureGate } from '../../hooks/useFeatureGate';
import { PageLoader } from '../feedback';
import SubscriptionGate from './SubscriptionGate';
import AccessCheckError from './AccessCheckError';

export default function RequireFeature({ feature, children }) {
  const { allowed, loading, error, retry } = useFeatureGate(feature);
  if (loading) return <PageLoader />;
  if (error) return <AccessCheckError onRetry={retry} />;
  return allowed ? children : <SubscriptionGate featureKey={feature} />;
}
