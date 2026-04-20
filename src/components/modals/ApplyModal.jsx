import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { ButtonLoader } from '../feedback';
import { validateApplyMessage } from '../../utils/validators';

/**
 * Apply / "Express Interest" modal used by instructors on the Find Work
 * feed. Message is optional, but capped at 2000 chars — we validate on
 * submit and keep the button clickable so the user sees the error.
 */
export default function ApplyModal({ job, submitting, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [errors, setErrors]   = useState({});

  const handleSubmit = () => {
    const errs = validateApplyMessage(message);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(message.trim() || null);
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-5 py-2.5 border border-[#E5E0D8] rounded-xl text-sm font-medium text-[#6B6B66] hover:border-[#9A9A94] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#CE4F56] text-white rounded-xl text-sm font-bold hover:bg-[#b8454c] transition-all disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? <ButtonLoader size={14} /> : <MessageCircle size={14} />}
        Send Application
      </button>
    </>
  );

  return (
    <BaseModal
      open
      title="Express Interest"
      subtitle={job?.title}
      size="md"
      zIndex="z-[60]"
      onClose={onClose}
      footer={footer}
    >
      <p className="text-xs text-[#6B6B66] leading-relaxed mb-4">
        Add a short note to introduce yourself. The studio will see your full profile
        alongside your message — keep it warm and specific.
      </p>
      <div>
        <label className="block text-[10px] font-bold text-[#9A9A94] tracking-widest uppercase mb-2">
          Your message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Hi! I'd love to teach at your studio. Here's a bit about me and my availability..."
          className={`w-full bg-[#FDFCF8] border rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all resize-none
            ${errors.message ? 'border-red-400 focus:border-red-500' : 'border-[#E5E0D8] focus:border-[#CE4F56]'}`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.message
            ? <p className="text-[10px] text-red-500">{errors.message}</p>
            : <span />}
          <p className="text-[10px] text-[#9A9A94]">{message.length}/2000</p>
        </div>
      </div>
    </BaseModal>
  );
}
