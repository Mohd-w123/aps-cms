"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoItem {
  _id: string;
  image: string;
  videoUrl?: string;
  order: number;
}

function toEmbedUrl(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function VideosPage() {
  const { slug: schoolSlug } = useSchool();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/gallery?type=video&limit=50", {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) {
          setVideos(json.data);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [schoolSlug]);

  const current = lightboxIndex !== null ? videos[lightboxIndex] : null;

  return (
    <>
      <PageBanner
        title="Videos"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: "Videos" },
        ]}
      />
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-video" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                No videos available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, i) => (
                <div
                  key={video._id}
                  className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  onClick={() => setLightboxIndex(i)}
                >
                  <Image
                    src={video.image}
                    alt={`Video ${i + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 ml-1" style={{ color: "var(--school-primary)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
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
                c !== null ? (c - 1 + videos.length) % videos.length : null
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
                c !== null ? (c + 1) % videos.length : null
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative w-[90vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {current.videoUrl ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={toEmbedUrl(current.videoUrl)}
                  title={`Video ${lightboxIndex + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            ) : (
              <Image
                src={current.image}
                alt={`Video ${lightboxIndex + 1}`}
                width={1200}
                height={675}
                className="w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
