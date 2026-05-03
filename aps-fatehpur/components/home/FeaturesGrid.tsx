"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Laptop,
  Trophy,
  Bus,
  Microscope,
  Music,
  Shield,
  Leaf,
  type LucideIcon,
} from "lucide-react";

interface FeatureData { title: string; desc: string; }

const iconMap: Record<string, LucideIcon> = {
  "quality education": BookOpen, "smart classrooms": Laptop, "advanced labs": Microscope,
  "sports excellence": Trophy, "arts & culture": Music, "safe transport": Bus,
  "safety & security": Shield, "green campus": Leaf,
};
const defaultIcons: LucideIcon[] = [BookOpen, Laptop, Microscope, Trophy, Music, Bus, Shield, Leaf];

const defaultFeatures: FeatureData[] = [
  { title: "Quality Education", desc: "CBSE-aligned curriculum with experienced faculty and modern teaching methodologies." },
  { title: "Smart Classrooms", desc: "Digital learning with interactive boards, projectors, and e-learning resources." },
  { title: "Advanced Labs", desc: "Fully equipped science, computer, and language labs for practical learning." },
  { title: "Sports Excellence", desc: "Professional coaching in cricket, football, badminton, and athletics." },
  { title: "Arts & Culture", desc: "Music, dance, drama, and fine arts clubs for creative expression." },
  { title: "Safe Transport", desc: "GPS-enabled school buses covering all major routes in and around Fatehpur." },
  { title: "Safety & Security", desc: "CCTV surveillance, secure campus, and trained security personnel." },
  { title: "Green Campus", desc: "Eco-friendly campus with gardens, rainwater harvesting, and solar panels." },
];

export function FeaturesGrid() {
  const [features, setFeatures] = useState<FeatureData[]>(defaultFeatures);

  useEffect(() => {
    fetch("/api/pages?limit=50")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const page = r.data.find((p: { slug: string }) => p.slug === "home-features");
          if (page?.content) {
            try {
              const arr = JSON.parse(page.content);
              if (Array.isArray(arr) && arr.length) setFeatures(arr);
            } catch { /* keep defaults */ }
          }
        }
      })
      .catch(() => {});
  }, []);

  const getIcon = (title: string, index: number): LucideIcon => {
    return iconMap[title.toLowerCase()] || defaultIcons[index % defaultIcons.length];
  };

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p
            className="text-sm font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--school-primary)" }}
          >
            Why Choose Us
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Our Key Features
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = getIcon(f.title, i);
            return (
            <div
              key={f.title + i}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-lg mb-4 transition-colors"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: "var(--text-dark)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.desc}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
