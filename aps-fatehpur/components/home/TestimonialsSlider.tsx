"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial { name: string; role: string; quote: string; }

const fallbackTestimonials: Testimonial[] = [
  { name: "Mr. Rajesh Sharma", role: "Parent", quote: "My children have thrived at this school. The teachers are dedicated, the environment is safe, and the results speak for themselves." },
  { name: "Ayesha Siddiqui", role: "Alumni, Batch 2020", quote: "This school gave me not just education but confidence and values that have shaped my career." },
  { name: "Dr. Amit Verma", role: "Parent & Doctor", quote: "The holistic approach to education here is remarkable. My son has developed academically and personally." },
];

export function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/alumni?limit=20")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const approved = r.data.filter((a: { isApproved: boolean; testimonial?: string }) => a.isApproved && a.testimonial);
          if (approved.length) {
            setTestimonials(approved.map((a: { name: string; batch?: string; currentRole?: string; testimonial: string }) => ({
              name: a.name,
              role: [a.currentRole, a.batch ? `Batch ${a.batch}` : ""].filter(Boolean).join(", ") || "Alumni",
              quote: a.testimonial,
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--school-primary)" }}
          >
            What People Say
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Testimonials
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-2xl mx-auto text-center">
          <Quote
            className="h-10 w-10 mx-auto mb-6 opacity-20"
            style={{ color: "var(--school-primary)" }}
          />
          <p
            className="text-lg md:text-xl leading-relaxed mb-8 italic"
            style={{ color: "var(--text-dark)" }}
          >
            &ldquo;{t.quote}&rdquo;
          </p>
          <div className="mb-8">
            <p
              className="font-semibold text-base"
              style={{ color: "var(--school-primary)" }}
            >
              {t.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t.role}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white"
              style={{
                borderColor: "var(--school-primary)",
                color: "var(--school-primary)",
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === current ? "w-8" : "w-2.5"
                  }`}
                  style={{
                    backgroundColor:
                      i === current
                        ? "var(--school-primary)"
                        : "var(--school-primary)",
                    opacity: i === current ? 1 : 0.3,
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white"
              style={{
                borderColor: "var(--school-primary)",
                color: "var(--school-primary)",
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
