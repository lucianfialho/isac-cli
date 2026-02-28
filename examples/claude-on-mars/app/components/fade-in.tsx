"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { inView, animate } from "motion";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  style,
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial state for animation (JS only, after hydration)
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const cleanup = inView(
      el,
      () => {
        (animate as Function)(
          el,
          {
            opacity: [0, 1],
            transform: ["translateY(20px)", "translateY(0px)"],
          },
          {
            duration,
            delay,
            easing: [0.25, 0.1, 0.25, 1],
          }
        );
      },
      { margin: "0px 0px -50px 0px" }
    );

    return cleanup;
  }, [delay, duration]);

  return (
    <div ref={ref} style={{ opacity: 1, ...style }} className={className}>
      {children}
    </div>
  );
}
