"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const images = [
  { src: "/images/gallery-1.jpg", alt: "Annual Day Celebration" },
  { src: "/images/gallery-2.jpg", alt: "Science Exhibition" },
  { src: "/images/gallery-3.jpg", alt: "Sports Day" },
  { src: "/images/gallery-4.jpg", alt: "Republic Day" },
  { src: "/images/gallery-5.jpg", alt: "Cultural Program" },
  { src: "/images/gallery-6.jpg", alt: "Classroom Activity" },
];

export function GalleryPreview() {
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

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl ${
                i === 0 ? "md:row-span-2" : ""
              }`}
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
    </section>
  );
}
