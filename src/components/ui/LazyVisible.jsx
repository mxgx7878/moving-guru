import { useEffect, useRef, useState } from 'react';

/**
 * LazyVisible
 * ─────────────────────────────────────────────────────────────
 * Mounts children only when the wrapper is near/in the viewport.
 * When scrolled out of view, children are unmounted and a
 * placeholder div with the last-measured height keeps page layout
 * stable (no scrollbar jumps, no scroll-position shift).
 *
 * Used for long lists (Find Work, Search Instructors) so the React
 * tree only ever holds the cards the user is actually looking at,
 * plus a small read-ahead buffer governed by `rootMargin`.
 *
 * @param {ReactNode} children
 * @param {number}    estimatedHeight  Initial placeholder height (px) before first render
 * @param {string}    rootMargin       IntersectionObserver pre-load buffer
 * @param {string}    className        Optional wrapper classes
 */
export default function LazyVisible({
  children,
  estimatedHeight = 320,
  rootMargin = '600px 0px',
  className = '',
}) {
  const ref       = useRef(null);
  const heightRef = useRef(estimatedHeight);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible((wasVisible) => {
          if (entry.isIntersecting) return true;
          // Capture the rendered height before unmounting so the
          // placeholder reserves the same vertical space.
          if (wasVisible) {
            const h = el.getBoundingClientRect().height;
            if (h > 0) heightRef.current = h;
          }
          return false;
        });
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={!isVisible ? { minHeight: heightRef.current } : undefined}
    >
      {isVisible ? children : null}
    </div>
  );
}