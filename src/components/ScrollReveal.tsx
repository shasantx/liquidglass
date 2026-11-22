import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Lightweight one-shot blur-focus scroll reveal.
 * Unobserves immediately once revealed so scrolled sections incur zero ongoing CPU/GPU cost.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.02, rootMargin: '0px 0px -16px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${revealed ? 'is-visible' : ''} ${className}`}
      style={delayMs ? ({ '--reveal-delay': `${delayMs}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
};
