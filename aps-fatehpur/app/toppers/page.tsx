"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TopperItem {
  _id: string;
  name: string;
  photo: string;
  percentage: number;
  year: string;
  exam: string;
  rank: number;
  order: number;
}

export default function ToppersPage() {
  const { slug: schoolSlug } = useSchool();
  const [toppers, setToppers] = useState<TopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchToppers() {
      try {
        const res = await fetch("/api/toppers?limit=50", {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) {
          setToppers(json.data);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    fetchToppers();
  }, [schoolSlug]);

  // Auto-scroll carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || toppers.length === 0) return;
    const interval = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) {
        el.scrollLeft = 0;
      } else {
        el.scrollBy({ left: 2 });
      }
    }, 30);
    return () => clearInterval(interval);
  }, [toppers]);

  return (
    <>
      <PageBanner
        title="Our Toppers"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Toppers" }]}
      />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--school-primary)" }}>
              Achievements
            </p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-dark)" }}>
              Our Top Achievers
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Click on any result card to view in full size
            </p>
          </div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 h-72 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : toppers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                Topper results will be available soon.
              </p>
            </div>
          ) : (
            <>
              {/* Auto-scrolling carousel */}
              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                {toppers.map((topper, i) => (
                  <div
                    key={topper._id}
                    className="flex-shrink-0 w-56 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <Image
                      src={topper.photo}
                      alt={topper.name || `Topper ${i + 1}`}
                      width={224}
                      height={300}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Full grid below carousel */}
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-dark)" }}>
                  All Results
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {toppers.map((topper, i) => (
                    <div
                      key={topper._id}
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setLightboxIndex(i)}
                    >
                      <Image
                        src={topper.photo}
                        alt={topper.name || `Topper ${i + 1}`}
                        width={224}
                        height={300}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && toppers[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c - 1 + toppers.length) % toppers.length : null
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((c) =>
                c !== null ? (c + 1) % toppers.length : null
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={toppers[lightboxIndex].photo}
              alt={toppers[lightboxIndex].name || `Topper ${lightboxIndex + 1}`}
              width={800}
              height={1000}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
