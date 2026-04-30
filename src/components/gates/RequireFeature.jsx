// src/components/gates/RequireFeature.jsx
//
// Route-level subscription gate. Drop this into App.jsx around any
// route that needs a specific feature.
//
// Usage in App.jsx:
//   import RequireFeature from './components/gates/RequireFeature';
//   import { FEATURE_KEYS } from './constants/featureConstants';
//
//   <Route path="messages" element={
//     <RequireFeature feature={FEATURE_KEYS.MESSAGING}>
//       <Messages />
//     </RequireFeature>
//   } />
//
// Behavior:
//   • Subscription still loading → render children (avoids flash)
//   • User HAS subscription + feature allowed → render children
//   • Otherwise → render the SubscriptionGate component
//
// Single source of truth: useFeatureGate hook reads from Redux.

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { fetchCurrentSubscription } from '../../store/actions/subscriptionAction';
import SubscriptionGate from './SubscriptionGate';

export default function RequireFeature({ feature, children }) {
  const dispatch = useDispatch();
  const { allowed, loading, hasSubscription } = useFeatureGate(feature);

  console.log(allowed, loading, hasSubscription);

  // Make sure subscription is loaded — if the user lands directly on a
  // gated route (e.g. via a bookmark), Subscription.jsx may not have run yet.
  useEffect(() => {
    if (!hasSubscription && !loading) {
      dispatch(fetchCurrentSubscription());
    }
  }, [dispatch, hasSubscription, loading]);

  if (loading) return children;        // optimistic during fetch
  if (allowed)  return children;       // gate passed
  return <SubscriptionGate featureKey={feature} />;
}