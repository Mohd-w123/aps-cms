"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingDecorations } from "@/components/shared/PlayfulUI";
import { useSchool } from "@/hooks/useSchool";

interface Slide {
  _id: string; image: string; title: string; subtitle: string;
  titleColor?: string; subtitleColor?: string;
  ctaLabel?: string; ctaLink?: string;
}

const fallbackSlides: Slide[] = [
  { _id: "f1", image: "/images/hero-1.jpg", title: "Welcome to Excellence in Education", subtitle: "Nurturing minds, building futures since 1995", ctaLabel: "Apply Now", ctaLink: "/academy/admissions" },
  { _id: "f2", image: "/images/hero-2.jpg", title: "State-of-the-Art Infrastructure", subtitle: "Modern classrooms, labs, and sports facilities", ctaLabel: "View Facilities", ctaLink: "/facilities" },
  { _id: "f3", image: "/images/hero-3.jpg", title: "100% Board Results Every Year", subtitle: "Our students consistently achieve top ranks", ctaLabel: "Meet Our Toppers", ctaLink: "/toppers" },
];

export function HeroCarousel() {
  const { slug: schoolSlug } = useSchool();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!schoolSlug) return;
    const controller = new AbortController();
    setSlides([]);
    setLoaded(false);
    fetch(`/api/sliders?school=${schoolSlug}&scope=school&limit=10`, { cache: "no-store", signal: controller.signal })
      .then(r => r.json())
      .then(r => { setSlides(r.success && r.data?.length ? r.data : fallbackSlides); })
      .catch(err => { if (err.name !== "AbortError") setSlides(fallbackSlides); })
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, [schoolSlug]);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [current, slides.length]);

  if (!loaded || slides.length === 0) {
    return (
      <section className="relative h-[68vh] min-h-[560px] md:h-[78vh] lg:h-[84vh] max-h-[860px] overflow-hidden" style={{ background: "linear-gradient(to right, var(--text-dark, #22235b), var(--school-primary, #499f42))" }}>
        <FloatingDecorations />
      </section>
    );
  }

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
        <div className="absolute inset-0 bg-gradient-to-br from-[#22235b]/70 via-[#22235b]/45 to-[#499f42]/25" />
      </div>

      {/* Floating decorations */}
      <FloatingDecorations />

      {/* Content */}
      <div className="relative z-10 flex h-full items-start">
        <div className="container mx-auto px-4 md:px-8 pt-24 md:pt-28 lg:pt-32">
          <div className="max-w-2xl text-white">
            <h1
              className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)]"
              style={{ color: slide.titleColor || "#ffffff" }}
            >
              {slide.title}
            </h1>
            <p
              className="text-lg md:text-xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
              style={{ color: slide.subtitleColor || "rgba(255,255,255,0.9)" }}
            >
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

    </section>
  );
}
