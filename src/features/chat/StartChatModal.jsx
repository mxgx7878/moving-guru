import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { createConversation } from '../../store/actions/messageAction';
import { Modal, Button } from '../../components/ui';

/**
 * StartChatModal
 * -----------------------------------------------------------------
 * First-message composer. Parent conditionally mounts it — same
 * pattern as ApplyJobModal / InstructorProfileModal:
 *
 *   {chatTarget && (
 *     <StartChatModal
 *       recipientId={chatTarget.id}        // USER id (users table)
 *       recipientName={chatTarget.name}
 *       onClose={() => setChatTarget(null)}
 *     />
 *   )}
 *
 * POST /conversations backend par findOrCreate karta hai — agar in
 * dono ke beech pehle se thread hai to message usi me jata hai,
 * duplicate conversation kabhi nahi banti. Send ke baad Messages page
 * par navigate hota hai aur wahi thread khul jati hai (Messages.jsx
 * ka deep-link state isi ke liye hai).
 */
export default function StartChatModal({ recipientId, recipientName, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  // flattenUser spreads detail over the user, so `user.id` becomes the
  // user_details id. The real users.id always lives in `user_id`
  // (admins have no detail row, hence the `id` fallback).
  const myId = user?.user_id ?? user?.id;
  const messagesBase = user?.role === 'studio' ? '/studio/messages' : '/portal/messages';

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!recipientId) return null;
  const isSelf = Number(recipientId) === Number(myId);

  const handleClose = () => {
    if (!sending) onClose?.();
  };

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending || isSelf) return;
    setSending(true);
    try {
      const result = await dispatch(
        createConversation({ recipientId, message: body }),
      ).unwrap();

      const conversationId = result?.data?.conversation?.id;
      setSending(false);
      toast.success('Message sent');
      onClose?.();
      navigate(messagesBase, { state: { conversationId } });
    } catch (err) {
      setSending(false);
      toast.error(
        err?.message || (typeof err === 'string' ? err : 'Failed to send message'),
      );
    }
  };

  return (
    <Modal
      open
      size="md"
      title={`Message ${recipientName || ''}`.trim()}
      subtitle="They'll see it instantly in their Messages"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={MessageCircle}
            loading={sending}
            disabled={isSelf || !text.trim()}
            onClick={handleSend}
          >
            Send Message
          </Button>
        </>
      }
    >
      {isSelf ? (
        <p className="text-sm text-[#9A9A94]">You can't message yourself.</p>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          autoFocus
          maxLength={5000}
          placeholder={`Write a message${recipientName ? ` to ${recipientName}` : ''}...`}
          className="w-full bg-white border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#4E7A1B] resize-none"
        />
      )}
    </Modal>
  );
}