"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before the reveal transition starts once in view. */
  delay?: number;
  /** Entrance direction. */
  from?: "up" | "left" | "right" | "none";
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Reveals children on scroll using IntersectionObserver.
 * Falls back to visible if IO is unavailable; reduced-motion users see no transform.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Static strings so Tailwind's JIT can detect the motion-safe variants.
  const hiddenMap: Record<NonNullable<RevealProps["from"]>, string> = {
    up: "motion-safe:translate-y-8 motion-safe:opacity-0",
    left: "motion-safe:-translate-x-8 motion-safe:opacity-0",
    right: "motion-safe:translate-x-8 motion-safe:opacity-0",
    none: "motion-safe:opacity-0",
  };

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        shown ? "translate-x-0 translate-y-0 opacity-100" : hiddenMap[from],
        className
      )}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
