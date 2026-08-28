"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { HorizontalScrollCarousel } from "@/components/shared/HorizontalScrollCarousel";
import { schools as allSchools } from "@/config/schools";

interface TopperItem {
  _id: string;
  name: string;
  photo: string;
  percentage: number;
  year: string;
  exam: string;
  rank: number;
  order: number;
  schoolId?: { _id: string; name: string; slug: string };
}

export default function ToppersPage() {
  const { slug: schoolSlug } = useSchool();
  const isGroup = schoolSlug === "apsfatehpur";

  const [toppers, setToppers] = useState<TopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeSchool, setActiveSchool] = useState<string>("all");

  const branchSchools = allSchools.filter((s) => s.slug !== "apsfatehpur");

  useEffect(() => {
    async function fetchToppers() {
      setLoading(true);
      try {
        const url = isGroup
          ? "/api/toppers?limit=100&scope=all"
          : "/api/toppers?limit=50";
        const res = await fetch(url, {
          headers: isGroup ? {} : { "x-school-slug": schoolSlug },
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
  }, [schoolSlug, isGroup]);

  const displayToppers =
    isGroup && activeSchool !== "all"
      ? toppers.filter((t) => t.schoolId?.slug === activeSchool)
      : toppers;

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

          {/* School filter tabs (group mode only) */}
          {isGroup && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setActiveSchool("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSchool === "all"
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  activeSchool === "all"
                    ? { backgroundColor: "var(--school-primary)" }
                    : undefined
                }
              >
                All Schools ({toppers.length})
              </button>
              {branchSchools.map((s) => {
                const count = toppers.filter((t) => t.schoolId?.slug === s.slug).length;
                return (
                  <button
                    key={s.slug}
                    onClick={() => setActiveSchool(s.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeSchool === s.slug
                        ? "text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      activeSchool === s.slug
                        ? { backgroundColor: s.theme.primary || "var(--school-primary)" }
                        : undefined
                    }
                  >
                    {s.name} {count > 0 ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 h-72 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : displayToppers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                Topper results will be available soon.
              </p>
            </div>
          ) : (
            <>
              <HorizontalScrollCarousel className="gap-5 pb-4 px-6 md:px-10">
                {displayToppers.map((topper, i) => (
                  <div
                    key={topper._id}
                    className="flex-shrink-0 w-56 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer relative bg-white border border-gray-100"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <Image
                      src={topper.photo}
                      alt={topper.name || `Topper ${i + 1}`}
                      width={224}
                      height={300}
                      className="w-full h-auto object-contain"
                    />
                    {isGroup && topper.schoolId && (
                      <div className="bg-black/70 text-white text-[11px] py-1.5 px-2 text-center truncate font-medium">
                        {topper.schoolId.name}
                      </div>
                    )}
                  </div>
                ))}
              </HorizontalScrollCarousel>

              {/* Full grid below carousel */}
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-dark)" }}>
                  All Results
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {displayToppers.map((topper, i) => (
                    <div
                      key={topper._id}
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer relative bg-white border border-gray-100 flex flex-col"
                      onClick={() => setLightboxIndex(i)}
                    >
                      <Image
                        src={topper.photo}
                        alt={topper.name || `Topper ${i + 1}`}
                        width={224}
                        height={300}
                        className="w-full h-auto object-contain flex-1"
                      />
                      {isGroup && topper.schoolId && (
                        <div className="bg-black/70 text-white text-[11px] py-1.5 px-2 text-center truncate font-medium">
                          {topper.schoolId.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && displayToppers[lightboxIndex] && (
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
                c !== null ? (c - 1 + displayToppers.length) % displayToppers.length : null
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
                c !== null ? (c + 1) % displayToppers.length : null
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh] text-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={displayToppers[lightboxIndex].photo}
              alt={displayToppers[lightboxIndex].name || `Topper ${lightboxIndex + 1}`}
              width={800}
              height={1000}
              className="max-h-[80vh] w-auto object-contain rounded-lg mx-auto"
            />
            {isGroup && displayToppers[lightboxIndex].schoolId && (
              <p className="text-white/80 text-sm mt-3 font-medium">
                {displayToppers[lightboxIndex].schoolId!.name}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
