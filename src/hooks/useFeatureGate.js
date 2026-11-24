import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentSubscription } from '../store/actions/subscriptionAction';
import { STATUS } from '../constants/apiConstants';

export function useFeatureGate(featureKey) {
  const dispatch = useDispatch();
  const { currentSubscription, currentStatus = STATUS.IDLE, currentError } = useSelector((s) => s.subscription);
  useEffect(() => {
    if (currentStatus === STATUS.IDLE) dispatch(fetchCurrentSubscription());
  }, [dispatch, currentStatus]);
  const hasSubscription = !!currentSubscription && ['active', 'trialing', 'past_due'].includes(currentSubscription.status);
  return {
    allowed: currentStatus === STATUS.SUCCEEDED && hasSubscription && (currentSubscription.plan?.featureKeys || []).includes(featureKey),
    hasSubscription,
    loading: currentStatus === STATUS.IDLE || currentStatus === STATUS.LOADING,
    error: currentStatus === STATUS.FAILED ? currentError : null,
    retry: () => dispatch(fetchCurrentSubscription()),
  };
}
