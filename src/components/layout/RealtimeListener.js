import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { initEcho, disconnectEcho } from '../../config/echo';
import { fetchConversations } from '../../store/actions/messageAction';
import { inboxMessageReceived } from '../../store/slices/messageSlice';

/**
 * RealtimeListener — CHAT PHASE
 * -----------------------------------------------------------------
 * Renders nothing. Mounted once inside PortalLayout (authed area only)
 * so every portal page shares one Pusher connection.
 *
 * Subscribes to private `user.{id}` and reacts to:
 *   .message.sent → inbox bump + toast (unless already on Messages)
 *
 * The live conversation channel (conversation.{id}) is handled by the
 * Messages page itself — this listener only covers the global layer.
 *
 * NOTE: notifications phase me ye file full-replace hogi
 * (.notification.created listener add hoga).
 */
export default function RealtimeListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);

  // flattenUser spreads detail over the user, so `user.id` is actually
  // the user_details id — the real users.id lives in `user_id` (admins
  // have no detail row, hence the `id` fallback). The private channel
  // name MUST use the real users.id or broadcasting auth will reject it.
  const myId = user?.user_id ?? user?.id;

  // Ref so the Echo callbacks always see the CURRENT path without
  // resubscribing on every navigation.
  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  // Load the inbox once when the portal mounts so the sidebar unread badge
  // is populated on every page (not just on the Messages screen). Realtime
  // inbox events keep it live afterwards.
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
        // Own messages also land on this channel via the conversation
        // broadcast fan-out — never toast yourself.
        if (msg.senderId === myId) return;

        dispatch(inboxMessageReceived(payload));

        // Already on the Messages page → the inbox/thread updates live,
        // a toast would just be noise.
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