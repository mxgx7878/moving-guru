import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { fetchCurrentSubscription } from '../../store/actions/subscriptionAction';
import SubscriptionGate from './SubscriptionGate';

export default function RequireFeature({ feature, children }) {
  const dispatch = useDispatch();
  const { allowed, loading, hasSubscription } = useFeatureGate(feature);

  console.log(allowed, loading, hasSubscription);

  useEffect(() => {
    if (!hasSubscription && !loading) {
      dispatch(fetchCurrentSubscription());
    }
  }, [dispatch, hasSubscription, loading]);

  if (loading) return children;
  if (allowed)  return children;
  return <SubscriptionGate featureKey={feature} />;
}
