import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../components/ui';

// Generic confirm dialog to replace window.confirm across the app. Plays nicer
// on mobile, can be branded, and keeps the danger/primary styling consistent.
export default function ConfirmModal({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open
      size="sm"
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <p className="text-sm text-[#6B6B66] leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
