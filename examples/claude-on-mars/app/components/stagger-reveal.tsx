"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { inView, animate, stagger } from "motion";

interface StaggerRevealProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  style?: React.CSSProperties;
  itemSelector?: string;
  className?: string;
}

export function StaggerReveal({
  children,
  staggerDelay = 0.15,
  duration = 0.6,
  style,
  itemSelector = "[data-reveal-item]",
  className = "",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    // Set initial state for animation (JS only, after hydration)
    items.forEach((item) => {
      (item as HTMLElement).style.opacity = "0";
      (item as HTMLElement).style.transform = "translateY(20px)";
    });

    const cleanup = inView(
      container,
      () => {
        (animate as Function)(
          items,
          {
            opacity: [0, 1],
            transform: ["translateY(20px)", "translateY(0px)"],
          },
          {
            duration,
            delay: stagger(staggerDelay),
            easing: [0.25, 0.1, 0.25, 1],
          }
        );
      },
      { margin: "0px 0px -50px 0px" }
    );

    return cleanup;
  }, [staggerDelay, duration, itemSelector]);

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
