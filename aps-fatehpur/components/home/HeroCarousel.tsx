"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WaveBottom, FloatingDecorations } from "@/components/shared/PlayfulUI";

interface Slide {
  _id: string; image: string; title: string; subtitle: string; ctaLabel?: string; ctaLink?: string;
}

const fallbackSlides: Slide[] = [
  { _id: "f1", image: "/images/hero-1.jpg", title: "Welcome to Excellence in Education", subtitle: "Nurturing minds, building futures since 1995", ctaLabel: "Apply Now", ctaLink: "/academy/admissions" },
  { _id: "f2", image: "/images/hero-2.jpg", title: "State-of-the-Art Infrastructure", subtitle: "Modern classrooms, labs, and sports facilities", ctaLabel: "View Facilities", ctaLink: "/facilities" },
  { _id: "f3", image: "/images/hero-3.jpg", title: "100% Board Results Every Year", subtitle: "Our students consistently achieve top ranks", ctaLabel: "Meet Our Toppers", ctaLink: "/toppers" },
];

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/sliders?scope=school&limit=10")
      .then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setSlides(r.data); })
      .catch(() => {});
  }, []);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[68vh] min-h-[560px] md:h-[78vh] lg:h-[84vh] max-h-[860px] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--text-dark, #22235b)CC, var(--text-dark, #22235b)80, var(--school-primary, #499f42)4D)" }} />
      </div>

      {/* Floating decorations */}
      <FloatingDecorations />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {slide.subtitle}
            </p>
            {slide.ctaLabel && slide.ctaLink && (
              <Link
                href={slide.ctaLink}
                className="inline-block rounded-full px-8 py-3 font-semibold text-base transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: "var(--accent-yellow, #d4e96e)",
                  color: "var(--text-dark, #22235b)",
                }}
              >
                {slide.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full text-white backdrop-blur-sm transition-all hover:scale-110"
        style={{ backgroundColor: "color-mix(in srgb, var(--school-primary, #499f42) 70%, transparent)" }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full text-white backdrop-blur-sm transition-all hover:scale-110"
        style={{ backgroundColor: "color-mix(in srgb, var(--school-primary, #499f42) 70%, transparent)" }}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? "w-8"
                : "w-2.5 bg-white/50 hover:bg-white/70"
            }`}
            style={i === current ? { backgroundColor: "var(--accent-yellow, #d4e96e)" } : undefined}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Wave bottom divider */}
      <WaveBottom className="text-white" />
    </section>
  );
}
