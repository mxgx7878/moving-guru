import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui';

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
