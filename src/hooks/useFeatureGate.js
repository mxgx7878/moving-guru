import { useSelector } from 'react-redux';

export function useFeatureGate(featureKey) {
  const subscriptionState = useSelector((s) => s.subscription) || {};

  const currentSubscription = subscriptionState.currentSubscription;
  const allowedFeatures     = currentSubscription?.plan?.featureKeys || []; 
  const status              = subscriptionState.status;

  console.log(subscriptionState)

  const hasSubscription =
    !!currentSubscription &&
    ['active', 'trialing', 'past_due'].includes(currentSubscription.status);

  const allowed = hasSubscription && allowedFeatures.includes(featureKey);

  return {
    allowed,
    hasSubscription,
    loading: status === 'loading',
  };
}
