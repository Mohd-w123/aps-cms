"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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
      className="relative py-20 overflow-hidden"
      style={{ backgroundColor: "var(--accent-yellow)" }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

      <div className="container relative mx-auto px-4 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: "var(--school-primary)" }}
        >
          {cta.heading}
        </h2>
        <p
          className="text-lg mb-8 max-w-2xl mx-auto"
          style={{ color: "var(--school-primary)", opacity: 0.85 }}
        >
          {cta.body}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={cta.btn1Link}
            className="inline-block rounded-full px-8 py-3 font-semibold text-base text-white transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--accent-red)" }}
          >
            {cta.btn1Label}
          </Link>
          <Link
            href={cta.btn2Link}
            className="inline-block rounded-full px-8 py-3 font-semibold text-base border-2 transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--school-primary)",
              color: "var(--school-primary)",
            }}
          >
            {cta.btn2Label}
          </Link>
        </div>
      </div>
    </section>
  );
}
