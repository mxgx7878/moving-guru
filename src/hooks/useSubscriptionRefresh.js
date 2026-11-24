import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentSubscription } from '../store/actions/subscriptionAction';
import { getMe } from '../store/actions/authAction';
import { STATUS } from '../constants/apiConstants';

export default function useSubscriptionRefresh(role) {
  const dispatch = useDispatch();
  const currentStatus = useSelector((state) => state.subscription.currentStatus);
  const lastFocusRefresh = useRef(0);

  useEffect(() => {
    if (role !== 'admin' && currentStatus === STATUS.IDLE) {
      dispatch(fetchCurrentSubscription());
    }
  }, [dispatch, role, currentStatus]);

  useEffect(() => {
    if (role === 'admin') return undefined;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastFocusRefresh.current < 1000) return;
      lastFocusRefresh.current = now;
      dispatch(getMe({ background: true }));
      dispatch(fetchCurrentSubscription({ background: true }));
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [dispatch, role]);
}
