import { useEffect, useRef, useState } from 'react';

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
