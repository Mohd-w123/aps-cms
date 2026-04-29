"use client";

import React from "react";
import Link from "next/link";

export function CTABanner() {
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
          Ready to Begin Your Child&apos;s Journey?
        </h2>
        <p
          className="text-lg mb-8 max-w-2xl mx-auto"
          style={{ color: "var(--school-primary)", opacity: 0.85 }}
        >
          Join thousands of families who trust us to provide the best education.
          Admissions are open for the 2026-27 session — limited seats available!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/academy/admissions"
            className="inline-block rounded-full px-8 py-3 font-semibold text-base text-white transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--accent-red)" }}
          >
            Apply for Admission
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-full px-8 py-3 font-semibold text-base border-2 transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--school-primary)",
              color: "var(--school-primary)",
            }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
