"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PlayfulSection, SectionHeader } from "@/components/shared/PlayfulUI";

interface TopperData {
  _id: string;
  name: string;
  photo?: string;
  percentage?: number;
  year?: string;
  exam?: string;
  rank?: number;
}

const fallbackToppers: TopperData[] = [
  { _id: "f1", name: "Topper 1", photo: "/images/toppers/topper-1.jpg" },
  { _id: "f2", name: "Topper 2", photo: "/images/toppers/topper-2.jpg" },
  { _id: "f3", name: "Topper 3", photo: "/images/toppers/topper-3.jpg" },
  { _id: "f4", name: "Topper 4", photo: "/images/toppers/topper-4.jpg" },
  { _id: "f5", name: "Topper 5", photo: "/images/toppers/topper-5.jpg" },
  { _id: "f6", name: "Topper 6", photo: "/images/toppers/topper-6.jpg" },
];

export function ToppersCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [toppers, setToppers] = useState<TopperData[]>(fallbackToppers);

  useEffect(() => {
    fetch("/api/toppers?limit=20")
      .then(r => r.json())
      .then(r => { if (r.success && r.data?.length) setToppers(r.data); })
      .catch(() => {});
  }, []);

  // Auto-scroll left continuously
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) {
        el.scrollLeft = 0;
      } else {
        el.scrollBy({ left: 2 });
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((c) => (c !== null ? (c - 1 + toppers.length) % toppers.length : null));
  const next = () =>
    setLightboxIndex((c) => (c !== null ? (c + 1) % toppers.length : null));

  return (
    <PlayfulSection className="py-20" style={{ backgroundColor: "var(--bg-light, #f6faf5)" }} blobs floatingIcons>
      <div className="container mx-auto px-4">
        <SectionHeader label="Achievements" title="Our Toppers" emoji="🏆" />

        {/* Auto-scrolling Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {toppers.map((t, i) => (
            <div
              key={t._id}
              className="flex-shrink-0 w-56 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer border border-gray-100"
              onClick={() => openLightbox(i)}
            >
              {t.photo ? (
                <Image
                  src={t.photo}
                  alt={t.name}
                  width={224}
                  height={300}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="w-full h-[300px] bg-gradient-to-br from-[var(--accent-blue,#9ab5db)]/20 to-[var(--school-primary,#499f42)]/10 flex items-center justify-center">
                  <span className="text-4xl font-heading font-bold opacity-30" style={{ color: "var(--text-dark, #22235b)" }}>{t.name?.charAt(0)}</span>
                </div>
              )}
              <div className="p-3 text-center bg-white">
                <p className="text-sm font-heading font-semibold truncate" style={{ color: "var(--text-dark, #22235b)" }}>{t.name}</p>
                {t.percentage && <p className="text-xs" style={{ color: "var(--school-primary, #499f42)" }}>{t.percentage}%{t.year ? ` • ${t.year}` : ""}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/toppers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "var(--school-primary, #499f42)" }}
          >
            View All Toppers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={toppers[lightboxIndex].photo || "/images/toppers/topper-1.jpg"}
              alt={toppers[lightboxIndex].name}
              width={800}
              height={1000}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            <p className="text-center text-white text-sm mt-3">
              {toppers[lightboxIndex].name}
              {toppers[lightboxIndex].percentage ? ` — ${toppers[lightboxIndex].percentage}%` : ""}
            </p>
          </div>
        </div>
      )}
    </PlayfulSection>
  );
}
