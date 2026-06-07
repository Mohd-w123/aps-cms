"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Star, Sparkles } from "lucide-react";
import { BlobDecoration, WaveBottom } from "@/components/shared/PlayfulUI";

interface PageBannerProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageBanner({ title, breadcrumbs }: PageBannerProps) {
  const crumbs = breadcrumbs || [{ label: "Home", href: "/" }, { label: title }];

  return (
    <section
      className="relative py-20 pb-28 text-white overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--school-primary, #499f42) 0%, var(--school-primary-dark, #3d8a37) 50%, var(--text-dark, #22235b) 100%)" }}
    >
      {/* Decorative blobs */}
      <BlobDecoration className="absolute -top-16 -right-16 w-64 h-64 text-white/10 animate-float-slow" />
      <BlobDecoration className="absolute -bottom-12 -left-12 w-48 h-48 opacity-15 animate-float" style={{ color: "var(--accent-yellow, #d4e96e)" }} />

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Star className="absolute top-8 left-[12%] h-5 w-5 opacity-60 animate-float" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
        <Sparkles className="absolute top-12 right-[15%] h-6 w-6 opacity-50 animate-float-slow" style={{ color: "var(--accent-blue, #9ab5db)" }} />
      </div>

      <div className="container relative mx-auto px-4 text-center z-10">
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{title}</h1>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center justify-center gap-1 text-sm text-white/80">
            {crumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--accent-yellow,#d4e96e)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Wave bottom divider */}
      <WaveBottom className="text-white" />
    </section>
  );
}
