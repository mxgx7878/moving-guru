import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { initEcho, disconnectEcho } from '../../config/echo';
import { fetchConversations } from '../../store/actions/messageAction';
import { inboxMessageReceived } from '../../store/slices/messageSlice';

export default function RealtimeListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);

  const myId = user?.user_id ?? user?.id;

  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (myId && token) dispatch(fetchConversations());
  }, [myId, token, dispatch]);

  useEffect(() => {
    if (!myId || !token) {
      disconnectEcho();
      return undefined;
    }

    const echo = initEcho(token);
    if (!echo) return undefined;

    const channelName = `user.${myId}`;
    const messagesPath = user.role === 'studio' ? '/studio/messages' : '/portal/messages';

    echo.private(channelName)
      .listen('.message.sent', (payload) => {
        const msg = payload?.message;
        if (!msg) return;
        if (msg.senderId === myId) return;

        dispatch(inboxMessageReceived(payload));

        if (pathRef.current.startsWith(messagesPath)) return;

        const senderName = payload?.sender?.role === 'admin'
          ? 'GURU'
          : (payload?.sender?.name || 'New message');
        const preview = msg.body.length > 80 ? `${msg.body.slice(0, 80)}…` : msg.body;

        toast(senderName, {
          description: preview,
          action: { label: 'Open', onClick: () => navigate(messagesPath) },
        });
      });

    return () => {
      echo.leave(channelName);
    };
  }, [myId, user?.role, token, dispatch, navigate]);

  return null;
}
