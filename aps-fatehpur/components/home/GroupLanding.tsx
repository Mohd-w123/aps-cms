"use client";

import React from "react";
import Image from "next/image";
import { schools } from "@/config/schools";

const schoolCards = schools.filter((s) => s.slug !== "apsfatehpur");

export function GroupLanding() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Hero Section */}
      <header className="text-center pt-16 pb-10 px-4">
        <div className="mx-auto mb-6">
          <Image
            src="/logos/apsfatehpur.png"
            alt="APS Fatehpur"
            width={100}
            height={100}
            className="mx-auto rounded-full bg-white p-2"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
          Ashraful Uloom Educational &amp; Welfare Society
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          A legacy of educational excellence since 1940 — Fatehpur Shekhawati
        </p>
      </header>

      {/* School Cards */}
      <section className="flex-1 flex items-start justify-center px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
          {schoolCards.map((school) => (
            <a
              key={school.slug}
              href={`https://${school.domain}`}
              onClick={(e) => {
                // For localhost dev, use query param instead
                if (window.location.hostname === "localhost") {
                  e.preventDefault();
                  window.location.href = `/?school=${school.slug}`;
                }
              }}
              className="group relative flex flex-col items-center rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                backgroundColor: "#1e293b",
                border: `2px solid ${school.theme.primary}33`,
              }}
            >
              {/* Colored top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: school.theme.primary }}
              />

              {/* Logo */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${school.theme.primary}20` }}
              >
                <Image
                  src={school.logo}
                  alt={school.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              </div>

              {/* School Name */}
              <h2 className="text-lg font-bold text-white text-center mb-2">
                {school.name}
              </h2>

              {/* Visit button */}
              <span
                className="mt-auto inline-block rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: school.theme.primary }}
              >
                Visit Website →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-700 text-gray-400 text-sm">
        © {new Date().getFullYear()} Ashraful Uloom Educational &amp; Welfare
        Society, Fatehpur Shekhawati
      </footer>
    </div>
  );
}
