"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Trophy } from "lucide-react";

const toppers = [
  { name: "Aarav Sharma", class: "XII", percent: "98.6%", year: "2025" },
  { name: "Priya Singh", class: "XII", percent: "97.8%", year: "2025" },
  { name: "Mohd Faiz", class: "X", percent: "97.2%", year: "2025" },
  { name: "Ananya Gupta", class: "XII", percent: "96.4%", year: "2025" },
  { name: "Ravi Kumar", class: "X", percent: "96.0%", year: "2025" },
  { name: "Sara Khan", class: "XII", percent: "95.8%", year: "2025" },
];

export function ToppersCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--school-primary)" }}
            >
              Achievements
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              Our Toppers
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30 transition-colors"
              style={{ borderColor: "var(--school-primary)", color: "var(--school-primary)" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30 transition-colors"
              style={{ borderColor: "var(--school-primary)", color: "var(--school-primary)" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {toppers.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 snap-start rounded-xl bg-white shadow-sm hover:shadow-lg transition-all p-5 text-center"
            >
              <div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                {t.name.charAt(0)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4" style={{ color: "var(--accent-yellow)" }} />
                <span
                  className="text-xl font-bold"
                  style={{ color: "var(--school-primary)" }}
                >
                  {t.percent}
                </span>
              </div>
              <h3
                className="font-semibold text-base mb-0.5"
                style={{ color: "var(--text-dark)" }}
              >
                {t.name}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Class {t.class} · {t.year}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/toppers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-colors"
            style={{ color: "var(--school-primary)" }}
          >
            View All Toppers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
