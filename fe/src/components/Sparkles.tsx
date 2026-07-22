"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type SparklesProps = {
  count?: number;
  className?: string;
  /** Tailwind color class for the sparkle glyph, e.g. "text-white/70". */
  colorClass?: string;
};

type Spark = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  opacity: number;
};

/**
 * Decorative falling sparkles. Purely presentational and pointer-transparent.
 * Respects prefers-reduced-motion via the `.animate-*` guard in globals.css.
 */
export function Sparkles({ count = 22, className, colorClass = "text-white" }: SparklesProps) {
  // Decorative + non-deterministic float styling → render client-only to avoid
  // any server/client hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sparks = useMemo<Spark[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i + 1) * 9301;
      const rand = (n: number) => ((Math.sin(seed * (n + 1)) + 1) / 2);
      return {
        left: rand(1) * 100,
        delay: rand(2) * 8,
        duration: 7 + rand(3) * 8,
        size: 6 + Math.round(rand(4) * 10),
        drift: (rand(5) - 0.5) * 60,
        opacity: 0.35 + rand(6) * 0.55,
      };
    });
  }, [count]);

  if (!mounted) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {sparks.map((s, i) => (
        <span
          key={i}
          className={cn("absolute -top-8 animate-sparkle-fall", colorClass)}
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            // custom prop consumed by the keyframes for horizontal drift
            ["--drift" as string]: `${s.drift}px`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M12 0c.6 5.5 2.9 7.9 8.5 8.5-5.6.6-7.9 2.9-8.5 8.5-.6-5.6-2.9-7.9-8.5-8.5C9.1 7.9 11.4 5.5 12 0z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
