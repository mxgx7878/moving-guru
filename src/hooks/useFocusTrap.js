import { useEffect, useRef } from 'react';

// CSS selector for elements considered focusable by default.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * useFocusTrap
 * ─────────────────────────────────────────────────────────────
 * When `active` becomes true:
 *   1. Remember the element that had focus before the modal opened.
 *   2. Move focus to the first focusable child (or the container).
 *   3. While active, keep Tab / Shift+Tab cycling inside the container.
 *   4. When deactivated, return focus to the element from step 1.
 *
 * Usage:
 *   const trapRef = useFocusTrap(open);
 *   <div ref={trapRef}>…</div>
 */
export default function useFocusTrap(active) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement;
    const node = containerRef.current;
    if (!node) return;

    // Focus the first focusable child so keyboard users start inside.
    const first = node.querySelector(FOCUSABLE);
    (first || node).focus?.();

    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(node.querySelectorAll(FOCUSABLE))
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = focusable[0];
      const lastEl  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    node.addEventListener('keydown', handleKey);

    return () => {
      node.removeEventListener('keydown', handleKey);
      // Defer so React finishes unmounting the overlay before we restore.
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        setTimeout(() => previouslyFocused.focus(), 0);
      }
    };
  }, [active]);

  return containerRef;
}
