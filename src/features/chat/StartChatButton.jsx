import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui';

/**
 * StartChatButton
 * -----------------------------------------------------------------
 * Convenience "Chat" button — directly opens the Messages screen with
 * the given recipient's thread (draft if none exists yet). Detail pages
 * jinke paas apna styled button hai wo seedha navigate karte hain; ye
 * un jagahon ke liye hai jahan koi button abhi nahi hai.
 *
 *   <StartChatButton recipientId={inst.id} recipientName={inst.name} />
 */
export default function StartChatButton({
  recipientId,
  recipientName,
  recipientAvatar,
  label = 'Chat',
  variant = 'primary',
  ...rest
}) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const messagesBase = user?.role === 'studio' ? '/studio/messages' : '/portal/messages';

  if (!recipientId) return null;

  return (
    <Button
      variant={variant}
      icon={MessageCircle}
      onClick={() => navigate(messagesBase, {
        state: { recipientId, recipientName, recipientAvatar },
      })}
      {...rest}
    >
      {label}
    </Button>
  );
}