import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Flag, ShieldAlert } from 'lucide-react';

/**
 * MessageActionsMenu — the (⋯) on a chat bubble. Sirf incoming
 * (doosre bande ke) messages par dikhana hai.
 */
export default function MessageActionsMenu({ onReportMessage, onReportProfile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Message options"
        className="p-1 rounded-full text-[#C4BCB4] hover:text-[#3E3D38] hover:bg-[#F4F0EA] transition-colors opacity-100 "
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-7 z-30 w-44 overflow-hidden rounded-xl border border-[#E5E0D8] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => pick(onReportMessage)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[#3E3D38] hover:bg-[#F4F0EA]"
          >
            <Flag size={14} className="text-[#C4BCB4]" />
            Report message
          </button>
          <button
            type="button"
            onClick={() => pick(onReportProfile)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-[#3E3D38] hover:bg-[#F4F0EA]"
          >
            <ShieldAlert size={14} className="text-[#C4BCB4]" />
            Report profile
          </button>
        </div>
      )}
    </div>
  );
}