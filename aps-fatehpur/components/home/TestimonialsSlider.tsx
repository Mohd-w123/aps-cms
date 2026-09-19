"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { PlayfulSection, SectionHeader, BlobDecoration } from "@/components/shared/PlayfulUI";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  photo?: string;
}

export function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
    const paramSchool = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("school") : null;
    const cookieSlug = typeof document !== "undefined" ? document.cookie.match(/school-slug=([^;]+)/)?.[1] : "apsfatehpur";
    const slug = paramSchool || cookieSlug || "apsfatehpur";
    const isGroup = isLocalhost ? !paramSchool : slug === "apsfatehpur";

    const url = isGroup ? "/api/alumni?limit=30&scope=all" : `/api/alumni?limit=20&school=${slug}&isApproved=true`;

    fetch(url)
      .then((r) => r.json())
      .then((r) => {
        if (r.success && Array.isArray(r.data)) {
          const approved = r.data.filter(
            (a: { isApproved: boolean; testimonial?: string }) =>
              a.isApproved && a.testimonial && a.testimonial.trim().length > 0
          );
          if (approved.length > 0) {
            setTestimonials(
              approved.map(
                (a: {
                  name: string;
                  batch?: string;
                  currentRole?: string;
                  testimonial: string;
                  photo?: string;
                  schoolId?: { name: string };
                  schoolName?: string;
                }) => {
                  const schoolLabel = a.schoolName || a.schoolId?.name || "";
                  const parts = [
                    a.currentRole,
                    a.batch ? `Batch ${a.batch}` : "",
                    isGroup && schoolLabel ? schoolLabel : "",
                  ].filter(Boolean);
                  return {
                    name: a.name,
                    role: parts.join(" • ") || "Alumni",
                    quote: a.testimonial,
                    photo: a.photo || "",
                  };
                }
              )
            );
          } else {
            setTestimonials([]);
          }
        }
      })
      .catch(() => {
        setTestimonials([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || testimonials.length === 0) {
    return null;
  }

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[current % testimonials.length];
  if (!t) return null;

  return (
    <PlayfulSection className="py-20" style={{ backgroundColor: "var(--bg-light, #f6faf5)" }} blobs>
      <div className="container mx-auto px-4">
        <SectionHeader label="What People Say" title="Testimonials" emoji="💬" />

        {/* Testimonial Card */}
        <div className="max-w-2xl mx-auto text-center relative">
          <BlobDecoration className="absolute -top-10 -right-10 w-32 h-32 opacity-20 animate-float-slow" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
          <Quote className="h-10 w-10 mx-auto mb-6 opacity-30" style={{ color: "var(--school-primary, #499f42)" }} />
          <p className="text-lg md:text-xl leading-relaxed mb-8 italic" style={{ color: "var(--text-dark, #22235b)" }}>
            &ldquo;{t.quote}&rdquo;
          </p>
          <div className="mb-8 flex flex-col items-center">
            {t.photo && (
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 shadow-md" style={{ outline: "2px solid var(--school-primary, #499f42)", outlineOffset: "2px" }}>
                <Image src={t.photo} alt={t.name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="font-heading font-semibold text-base" style={{ color: "var(--school-primary, #499f42)" }}>
              {t.name}
            </p>
            <p className="text-sm text-gray-500">
              {t.role}
            </p>
          </div>

          {/* Controls — only show if more than 1 testimonial */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:text-white"
                style={{ borderColor: "var(--school-primary, #499f42)", color: "var(--school-primary, #499f42)" }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2.5 rounded-full transition-all ${i === current ? "w-8" : "w-2.5 opacity-30"}`}
                    style={{ backgroundColor: "var(--school-primary, #499f42)" }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:text-white"
                style={{ borderColor: "var(--school-primary, #499f42)", color: "var(--school-primary, #499f42)" }}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PlayfulSection>
  );
}
