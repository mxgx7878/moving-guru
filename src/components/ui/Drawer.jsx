import { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

// Detail drawer used by every admin "preview X" modal (UserDetailDrawer,
// JobDetailDrawer, PostDetailDrawer). Behaves like Modal but exposes
// separate `header`, body (children) and `footer` slots so pages can
// render a rich header (avatar + status pills) instead of plain text.
// Escape and backdrop-click close. If `loading` is true it renders a
// centred spinner instead of the drawer body.
const SIZE = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Drawer({
  open = true,
  onClose,
  header,
  footer,
  loading = false,
  loadingSpinner,
  size = 'lg',
  headerClassName = '',
  bodyClassName = 'p-6 space-y-5 max-h-[60vh] overflow-y-auto',
  dismissOnBackdrop = true,
  zIndex = 'z-50',
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  if (loading) {
    return (
      <div className={`fixed inset-0 ${zIndex} bg-black/50 backdrop-blur-sm flex items-center justify-center p-4`}>
        <div className="bg-white rounded-2xl p-10">
          {loadingSpinner}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 ${zIndex} bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto`}
      onClick={dismissOnBackdrop ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl w-full ${SIZE[size] || SIZE.lg} shadow-2xl my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {header && (
          <div className={`px-6 py-5 rounded-t-2xl flex items-start justify-between gap-3 ${headerClassName}`}>
            <div className="min-w-0 flex-1">{header}</div>
            <IconButton
              variant="plain"
              tone="default"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="flex-shrink-0 hover:!bg-white/50"
            >
              <X size={18} />
            </IconButton>
          </div>
        )}

        <div className={bodyClassName}>{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[#E5E0D8] flex flex-wrap justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
