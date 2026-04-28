"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageBannerProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageBanner({ title, breadcrumbs }: PageBannerProps) {
  const crumbs = breadcrumbs || [{ label: "Home", href: "/" }, { label: title }];

  return (
    <section
      className="relative py-16 text-white"
      style={{ backgroundColor: "var(--school-primary)" }}
    >
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="container relative mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center justify-center gap-1 text-sm text-white/80">
            {crumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-white transition-colors"
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
    </section>
  );
}
