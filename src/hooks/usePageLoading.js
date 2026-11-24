import { useEffect, useState } from 'react';
import { STATUS } from '../constants/apiConstants';

// A returning route must not paint cached results before its mount request starts.
export default function usePageLoading(status) {
  const [entered, setEntered] = useState(false);
  useEffect(() => { setEntered(true); }, []);
  return !entered || status === STATUS.IDLE || status === STATUS.LOADING;
}
