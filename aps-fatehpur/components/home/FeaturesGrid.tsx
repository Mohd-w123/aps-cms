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
import { PlayfulSection, SectionHeader } from "@/components/shared/PlayfulUI";

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

  const pastelBgs = [
    "bg-green-50", "bg-blue-50", "bg-purple-50", "bg-amber-50",
    "bg-pink-50", "bg-cyan-50", "bg-lime-50", "bg-indigo-50",
  ];
  const iconColorVars = [
    "var(--school-primary, #499f42)", "var(--accent-blue, #9ab5db)", "var(--text-dark, #22235b)", "var(--accent-yellow, #d4e96e)",
    "var(--school-primary, #499f42)", "var(--accent-blue, #9ab5db)", "var(--text-dark, #22235b)", "var(--accent-yellow, #d4e96e)",
  ];

  return (
    <PlayfulSection className="py-20" style={{ backgroundColor: "var(--bg-light, #f6faf5)" }} floatingIcons blobs>
      <div className="container mx-auto px-4">
        <SectionHeader label="Why Choose Us" title="Our Key Features" emoji="✨" />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = getIcon(f.title, i);
            return (
            <div
              key={f.title + i}
              className={`group rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-white/50 hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400/60 ${pastelBgs[i % pastelBgs.length]}`}
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-7 w-7" style={{ color: iconColorVars[i % iconColorVars.length] }} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2" style={{ color: "var(--text-dark, #22235b)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {f.desc}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </PlayfulSection>
  );
}
