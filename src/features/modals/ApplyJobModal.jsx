import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';
import { validateApplyMessage } from '../../utils/validators';

// Apply / "Express Interest" modal used by instructors on Find Work and
// Saved Jobs. Message is optional but capped at 2000 chars.
export default function ApplyJobModal({ job, submitting, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const errs = validateApplyMessage(message);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(message.trim() || null);
  };

  return (
    <Modal
      open
      title="Express Interest"
      subtitle={job?.title}
      size="md"
      zIndex="z-[60]"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            icon={MessageCircle}
            loading={submitting}
            onClick={handleSubmit}
          >
            Send Application
          </Button>
        </>
      }
    >
      <p className="text-xs text-[#6B6B66] leading-relaxed mb-4">
        Add a short note to introduce yourself. The studio will see your full profile
        alongside your message — keep it warm and specific.
      </p>
      <Input
        textarea
        label="Your message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder="Hi! I'd love to teach at your studio. Here's a bit about me and my availability..."
        error={errors.message}
      />
    </Modal>
  );
}
