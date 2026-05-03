"use client";

import React, { useEffect, useRef, useState } from "react";
import { Megaphone } from "lucide-react";

const fallbackNotices = [
  "Admissions open for 2026-27 session — Apply before 31st May!",
  "Annual Sports Day on 15th May 2026 — All are welcome!",
  "Board exam results: 100% pass rate — Congratulations!",
];

export function RunningNotice() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notices, setNotices] = useState<string[]>(fallbackNotices);

  useEffect(() => {
    fetch("/api/news?category=notice&limit=10")
      .then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setNotices(r.data.map((n: { title: string }) => n.title)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let pos = 0;

    const animate = () => {
      pos -= 1;
      if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section
      className="overflow-hidden text-white py-2.5"
      style={{ backgroundColor: "var(--school-primary-dark)" }}
    >
      <div className="container mx-auto flex items-center gap-4 px-4">
        <div className="flex items-center gap-2 shrink-0 font-semibold text-sm">
          <Megaphone className="h-4 w-4" />
          <span>Notice:</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={scrollRef} className="flex gap-12 whitespace-nowrap text-sm">
            {/* Duplicate for seamless loop */}
            {[...notices, ...notices].map((notice, i) => (
              <span key={i} className="inline-block">
                ★ {notice}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
