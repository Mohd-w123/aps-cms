"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { X, ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";

interface GalleryItem {
  _id: string;
  type: "image" | "video";
  category: string;
  image: string;
  title?: string;
  videoUrl?: string;
}

export default function GalleryPage() {
  const { slug: schoolSlug } = useSchool();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery?limit=100", {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) setItems(json.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [schoolSlug]);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const categories = Array.from(new Set(filtered.map((i) => i.category)));

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filtered.length) % filtered.length : null
    );
  const goNext = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filtered.length : null
    );

  // Keyboard nav
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <>
      <PageBanner
        title="Gallery"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {(["all", "image", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  filter === f
                    ? { backgroundColor: "var(--school-primary)" }
                    : undefined
                }
              >
                {f === "all" ? "All" : f === "image" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No gallery items found.</p>
            </div>
          )}

          {/* Gallery grouped by category */}
          {!loading &&
            categories.map((cat) => {
              const catItems = filtered.filter((i) => i.category === cat);
              return (
                <div key={cat} className="mb-12">
                  {categories.length > 1 && (
                    <h3
                      className="text-xl font-bold capitalize mb-6"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {cat}
                    </h3>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catItems.map((item) => {
                      const globalIdx = filtered.indexOf(item);
                      return (
                        <div
                          key={item._id}
                          className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                          onClick={() => openLightbox(globalIdx)}
                        >
                          <Image
                            src={item.image}
                            alt={item.title || "Gallery image"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-10 w-10 text-white" />
                            </div>
                          )}
                          {item.title && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <p className="text-white text-sm font-medium truncate">
                                {item.title}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {filtered[lightboxIndex].type === "video" &&
            filtered[lightboxIndex].videoUrl ? (
              <div className="aspect-video">
                <iframe
                  src={filtered[lightboxIndex].videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : (
              <Image
                src={filtered[lightboxIndex].image}
                alt={filtered[lightboxIndex].title || "Gallery image"}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-auto mx-auto rounded-lg"
              />
            )}
            {filtered[lightboxIndex].title && (
              <p className="text-white text-center mt-3 text-sm">
                {filtered[lightboxIndex].title}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
