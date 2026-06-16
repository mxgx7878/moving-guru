import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

import { submitReport } from '../../store/actions/reportAction';
import { STATUS } from '../../constants/apiConstants';
import { Modal, Button } from '../../components/ui';

const REASONS = [
  { value: 'harassment',       label: 'Harassment or bullying' },
  { value: 'spam',             label: 'Spam' },
  { value: 'sexual_content',   label: 'Sexual content' },
  { value: 'hate_speech',      label: 'Hate speech' },
  { value: 'scam_fraud',       label: 'Scam / fraud' },
  { value: 'threats_violence', label: 'Threats or violence' },
  { value: 'other',            label: 'Other' },
];

/**
 * ReportModal — parent mounts it conditionally (StartChatModal jaisa):
 *
 *   {report && (
 *     <ReportModal
 *       type={report.type}                  // 'message' | 'profile'
 *       reportedUserId={report.reportedUserId}
 *       conversationId={report.conversationId}
 *       messageId={report.messageId}         // null for profile reports
 *       onClose={() => setReport(null)}
 *     />
 *   )}
 *
 * Last 10 messages backend khud snapshot karta hai — frontend sirf ids
 * bhejta hai, message content nahi.
 */
export default function ReportModal({
  type,
  reportedUserId,
  conversationId = null,
  messageId = null,
  onClose,
}) {
  const dispatch = useDispatch();
  const submitStatus = useSelector((s) => s.report.submitStatus);
  const submitting = submitStatus === STATUS.LOADING;

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [localError, setLocalError] = useState('');

  const isProfile = type === 'profile';

  const handleClose = () => {
    if (!submitting) onClose?.();
  };

  const handleSubmit = async () => {
    setLocalError('');
    if (!reason) {
      setLocalError('Please select a reason.');
      return;
    }
    if (reason === 'other' && !details.trim()) {
      setLocalError('Please add a few details for "Other".');
      return;
    }
    try {
      await dispatch(
        submitReport({
          type,
          reason,
          reportedUserId,
          conversationId,
          messageId: isProfile ? null : messageId,
          details: details.trim() || null,
        }),
      ).unwrap();
      toast.success('Report submitted. Our team will review it shortly.');
      onClose?.();
    } catch (err) {
      toast.error(err?.message || (typeof err === 'string' ? err : 'Could not submit report'));
    }
  };

  return (
    <Modal
      open
      size="md"
      title={isProfile ? 'Report profile' : 'Report message'}
      subtitle="Select a reason — our team reviews every report."
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Flag}
            loading={submitting}
            disabled={!reason || submitting}
            onClick={handleSubmit}
          >
            Submit report
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {REASONS.map((r) => {
          const active = reason === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition
                ${active
                  ? 'border-[#3E3D38] bg-[#F5FDA6]/50 text-[#3E3D38]'
                  : 'border-[#E5E0D8] text-[#3E3D38] hover:border-[#C4BCB4]'}`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border
                  ${active ? 'border-[#3E3D38]' : 'border-[#C4BCB4]'}`}
              >
                {active && <span className="h-2 w-2 rounded-full bg-[#3E3D38]" />}
              </span>
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-[#3E3D38]">
          Details {reason === 'other' ? <span className="text-red-500">(required)</span> : '(optional)'}
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add anything that helps us understand the issue..."
          className="w-full resize-none rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#4E7A1B]"
        />
      </div>

      {localError && <p className="mt-2 text-xs text-red-500">{localError}</p>}
    </Modal>
  );
}