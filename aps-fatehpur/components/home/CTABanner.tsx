"use client";

import React from "react";
import Link from "next/link";

export function CTABanner() {
  return (
    <section
      className="relative py-20 text-white overflow-hidden"
      style={{ backgroundColor: "var(--school-primary)" }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

      <div className="container relative mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Begin Your Child&apos;s Journey?
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of families who trust us to provide the best education.
          Admissions are open for the 2026-27 session — limited seats available!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/academy/admissions"
            className="inline-block rounded-full px-8 py-3 font-semibold text-base transition-transform hover:scale-105"
            style={{
              backgroundColor: "var(--accent-yellow)",
              color: "var(--text-dark)",
            }}
          >
            Apply for Admission
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-full px-8 py-3 font-semibold text-base border-2 border-white/60 hover:bg-white/10 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
