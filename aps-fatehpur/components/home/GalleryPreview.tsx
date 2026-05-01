"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  { src: "/images/gallery-3.jpg", alt: "Sports Day" },
  { src: "/images/gallery-4.jpg", alt: "Republic Day" },
  { src: "/images/gallery-5.jpg", alt: "Cultural Program" },
  { src: "/images/gallery-6.jpg", alt: "Classroom Activity" },
  { src: "/images/gallery-7.jpg", alt: "Award Ceremony" },
  { src: "/images/gallery-8.jpg", alt: "School Assembly" },
  { src: "/images/gallery-9.jpg", alt: "Art & Craft" },
  { src: "/images/gallery-10.jpg", alt: "School Event" },
  { src: "/images/gallery-11.jpg", alt: "Sports Meet" },
  { src: "/images/gallery-12.jpg", alt: "Annual Function" },
  { src: "/images/gallery-13.jpg", alt: "Outdoor Activity" },
  { src: "/images/gallery-14.jpg", alt: "Campus Life" },
  // { src: "/images/gallery-15.jpg", alt: "Celebration" },
  // { src: "/images/gallery-16.jpg", alt: "Workshop" },
  { src: "/images/gallery-17.jpg", alt: "Cultural Event" },
  // { src: "/images/gallery-18.jpg", alt: "Prize Distribution" },
  // { src: "/images/gallery-19.jpg", alt: "School Tour" },
  // { src: "/images/gallery-20.jpg", alt: "Independence Day" },
  { src: "/images/gallery-21.jpg", alt: "Science Fair" },
];

export function GalleryPreview() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((c) => (c !== null ? (c - 1 + images.length) % images.length : null));
  const next = () =>
    setLightboxIndex((c) => (c !== null ? (c + 1) % images.length : null));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--school-primary)" }}
          >
            Moments
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Photo Gallery
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                i === 0 ? "md:row-span-2" : ""
              }`}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={600}
                height={i === 0 ? 800 : 450}
                className={`w-full h-full object-cover ${
                  i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                } transition-transform group-hover:scale-105`}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <p className="text-white text-sm font-medium p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-colors"
            style={{ color: "var(--school-primary)" }}
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
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            <p className="text-center text-white text-sm mt-3">
              {images[lightboxIndex].alt} ({lightboxIndex + 1}/{images.length})
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
