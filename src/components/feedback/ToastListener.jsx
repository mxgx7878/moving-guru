import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function ToastListener() {
  const { error, message } = useSelector((state) => state.auth);
  const prevError = useRef(null);
  const prevMessage = useRef(null);

  useEffect(() => {
    if (error && error !== prevError.current) {
      toast.error(error);
    }
    prevError.current = error;
  }, [error]);

  useEffect(() => {
    if (message && message !== prevMessage.current) {
      toast.success(message);
    }
    prevMessage.current = message;
  }, [message]);

  return null;
}
