"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/images/hero-1.jpg",
    title: "Welcome to Excellence in Education",
    subtitle: "Nurturing minds, building futures since 1995",
    cta: { label: "Apply Now", href: "/academy/admissions" },
  },
  {
    image: "/images/hero-2.jpg",
    title: "State-of-the-Art Infrastructure",
    subtitle: "Modern classrooms, labs, and sports facilities",
    cta: { label: "View Facilities", href: "/facilities" },
  },
  {
    image: "/images/hero-3.jpg",
    title: "100% Board Results Every Year",
    subtitle: "Our students consistently achieve top ranks",
    cta: { label: "Meet Our Toppers", href: "/toppers" },
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          backgroundColor: "var(--school-primary)",
          backgroundImage: `url(${slide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {slide.subtitle}
            </p>
            <Link
              href={slide.cta.href}
              className="inline-block rounded-full px-8 py-3 font-semibold text-base transition-transform hover:scale-105"
              style={{
                backgroundColor: "var(--accent-yellow)",
                color: "var(--text-dark)",
              }}
            >
              {slide.cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? "w-8 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
