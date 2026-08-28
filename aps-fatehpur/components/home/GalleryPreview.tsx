"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";

interface GalleryImage {
  _id: string;
  image: string;
  title?: string;
  category?: string;
}

export function GalleryPreview() {
  const { slug: schoolSlug } = useSchool();
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!schoolSlug) return;
    const controller = new AbortController();
    setLoaded(false);
    setAllImages([]);
    fetch(`/api/gallery?school=${schoolSlug}&limit=30`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(r => { setAllImages(r.success && r.data?.length ? r.data : []); })
      .catch(err => { if (err.name !== "AbortError") setAllImages([]); })
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, [schoolSlug]);

  const categories = ["all", ...Array.from(new Set(allImages.map(g => g.category || "general")))];
  const images = catFilter === "all" ? allImages : allImages.filter(g => (g.category || "general") === catFilter);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((c) => (c !== null ? (c - 1 + images.length) % images.length : null));
  const next = () =>
    setLightboxIndex((c) => (c !== null ? (c + 1) % images.length : null));

  // Don't render until loaded; hide section if school has no gallery photos
  if (!loaded || allImages.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest mb-2 font-heading" style={{ color: "var(--school-primary, #499f42)" }}>
            📸 Moments
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold" style={{ color: "var(--text-dark, #22235b)" }}>
            Photo Gallery
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 flex-wrap mb-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                catFilter === c
                  ? "text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
              style={catFilter === c ? { backgroundColor: "var(--school-primary, #499f42)" } : undefined}
            >
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={img._id}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                i === 0 ? "md:row-span-2" : ""
              }`}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img.image}
                alt={img.title || `Gallery ${i + 1}`}
                width={600}
                height={i === 0 ? 800 : 450}
                className={`w-full h-full object-cover ${
                  i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                } transition-transform group-hover:scale-105`}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <p className="text-white text-sm font-medium p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  {img.title || `Photo ${i + 1}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "var(--school-primary, #499f42)" }}
          >
            View Full Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].image}
              alt={images[lightboxIndex].title || `Photo ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            <p className="text-center text-white text-sm mt-3">
              {images[lightboxIndex].title || `Photo`} ({lightboxIndex + 1}/{images.length})
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
