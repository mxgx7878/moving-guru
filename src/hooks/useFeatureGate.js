// src/hooks/useFeatureGate.js
//
// Returns whether the current user's plan allows a given feature.
// Defensive: works even if the slice hasn't been updated yet (no
// allowedFeatures key in state) — treats missing array as empty.

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