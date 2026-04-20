import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal shell. Handles backdrop, click-outside-to-close, Escape key,
 * and a consistent header/body/footer layout. Every modal in the app wraps
 * its content in this so spacing and close-behaviour stay identical.
 *
 * Props:
 *   open       — boolean (caller-controlled visibility)
 *   title      — header string (optional)
 *   subtitle   — small text under the title (optional)
 *   size       — 'sm' | 'md' | 'lg' | 'xl' — max-width class
 *   zIndex     — 'z-50' by default; use 'z-[60]' for nested modals
 *   hideClose  — hide the built-in X button
 *   onClose    — callback
 *   footer     — JSX rendered in the sticky footer bar
 *   children   — body content
 */
const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function BaseModal({
  open = true,
  title,
  subtitle,
  size = 'md',
  zIndex = 'z-50',
  hideClose = false,
  onClose,
  footer,
  children,
}) {
  // Close on Escape for keyboard users.
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
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${SIZE_CLASS[size] || SIZE_CLASS.md} shadow-2xl my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h2 className="font-['Unbounded'] text-base font-black text-[#3E3D38] truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[10px] text-[#9A9A94] mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#FBF8E4] rounded-lg transition-colors text-[#9A9A94] flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[#E5E0D8] flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
