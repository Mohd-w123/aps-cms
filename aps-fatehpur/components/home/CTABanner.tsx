"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BlobDecoration, WaveTop, FloatingDecorations } from "@/components/shared/PlayfulUI";

interface CtaData {
  heading: string; body: string;
  btn1Label: string; btn1Link: string;
  btn2Label: string; btn2Link: string;
}

const defaults: CtaData = {
  heading: "Ready to Begin Your Child's Journey?",
  body: "Join thousands of families who trust us to provide the best education. Admissions are open for the 2026-27 session — limited seats available!",
  btn1Label: "Apply for Admission", btn1Link: "/academy/admissions",
  btn2Label: "Contact Us", btn2Link: "/contact",
};

export function CTABanner() {
  const [cta, setCta] = useState<CtaData>(defaults);

  useEffect(() => {
    fetch("/api/pages?limit=50")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const page = r.data.find((p: { slug: string }) => p.slug === "home-cta");
          if (page?.content) {
            try { const obj = JSON.parse(page.content); setCta(prev => ({ ...prev, ...obj })); } catch { /* keep defaults */ }
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--accent-yellow, #d4e96e) 0%, var(--school-primary, #499f42) 100%)" }}
    >
      {/* Wave top */}
      <WaveTop className="text-white" />

      {/* Decorative blobs */}
      <BlobDecoration className="absolute -top-16 -right-16 w-64 h-64 text-white/15 animate-float-slow" />
      <BlobDecoration className="absolute -bottom-12 -left-12 w-48 h-48 opacity-10 animate-float" style={{ color: "var(--text-dark, #22235b)" }} />

      <FloatingDecorations />

      <div className="container relative mx-auto px-4 text-center z-10">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--text-dark, #22235b)" }}>
          {cta.heading}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-80" style={{ color: "var(--text-dark, #22235b)" }}>
          {cta.body}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={cta.btn1Link}
            className="inline-block rounded-full px-8 py-3 font-semibold text-base text-white transition-all hover:scale-105 shadow-lg hover:opacity-90"
            style={{ backgroundColor: "var(--text-dark, #22235b)" }}
          >
            {cta.btn1Label}
          </Link>
          <Link
            href={cta.btn2Link}
            className="inline-block rounded-full px-8 py-3 font-semibold text-base border-2 transition-all hover:text-white"
            style={{ borderColor: "var(--text-dark, #22235b)", color: "var(--text-dark, #22235b)" }}
          >
            {cta.btn2Label}
          </Link>
        </div>
      </div>
    </section>
  );
}
