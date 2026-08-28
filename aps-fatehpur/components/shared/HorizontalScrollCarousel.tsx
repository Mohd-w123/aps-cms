"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollCarouselProps {
  children: React.ReactNode;
  className?: string;
  /** Pixels to scroll per manual arrow click */
  scrollAmount?: number;
  /** Auto-scroll speed in pixels per second */
  autoScrollSpeed?: number;
  /** Pause auto-scroll after manual navigation (ms) */
  pauseAfterManualMs?: number;
}

export function HorizontalScrollCarousel({
  children,
  className = "",
  scrollAmount = 280,
  autoScrollSpeed = 12,
  pauseAfterManualMs = 3500,
}: HorizontalScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef(0);

  const pauseAutoScroll = useCallback(() => {
    pausedUntilRef.current = Date.now() + pauseAfterManualMs;
  }, [pauseAfterManualMs]);

  const scrollBy = useCallback(
    (delta: number) => {
      const el = scrollRef.current;
      if (!el) return;
      pauseAutoScroll();
      el.scrollBy({ left: delta, behavior: "smooth" });
    },
    [pauseAutoScroll]
  );

  // Smooth slow auto-scroll via requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId = 0;
    let lastTime = 0;

    const tick = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaMs = time - lastTime;
      lastTime = time;

      const canScroll = el.scrollWidth > el.clientWidth + 2;
      const isPaused = Date.now() < pausedUntilRef.current;

      if (canScroll && !isPaused) {
        const move = (autoScrollSpeed * deltaMs) / 1000;
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (el.scrollLeft >= maxScroll - 1) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += move;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoScrollSpeed]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-scrollAmount)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 -translate-x-1/2 md:translate-x-0 md:left-2"
        style={{ backgroundColor: "color-mix(in srgb, var(--school-primary, #499f42) 75%, transparent)" }}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollBy(scrollAmount)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 translate-x-1/2 md:translate-x-0 md:right-2"
        style={{ backgroundColor: "color-mix(in srgb, var(--school-primary, #499f42) 75%, transparent)" }}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide ${className}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
