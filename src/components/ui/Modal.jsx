import { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import useFocusTrap from '../../hooks/useFocusTrap';

// Single reusable Modal shell used by every modal in the app.
// Handles backdrop click-to-close, Escape key, focus trap + restore,
// and a consistent header/body/footer layout.
const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open = true,
  title,
  subtitle,
  size = 'md',
  zIndex = 'z-50',
  hideClose = false,
  dismissOnBackdrop = true,
  onClose,
  footer,
  headerClassName = '',
  bodyClassName = '',
  children,
}) {
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto`}
      onClick={dismissOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div
        ref={trapRef}
        tabIndex={-1}
        className={`bg-white rounded-2xl w-full ${SIZE_CLASS[size] || SIZE_CLASS.md} shadow-2xl my-8 outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className={`px-6 py-4 border-b border-edge flex items-center justify-between gap-3 ${headerClassName}`}>
            <div className="min-w-0">
              {title && (
                <h2 className="font-unbounded text-base font-black text-ink truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[10px] text-ink-soft mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            {!hideClose && (
              <IconButton
                variant="plain"
                tone="default"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="flex-shrink-0"
              >
                <X size={18} />
              </IconButton>
            )}
          </div>
        )}

        <div className={`p-6 ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-edge flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
