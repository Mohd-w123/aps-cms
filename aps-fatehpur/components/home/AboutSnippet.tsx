"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";

export function AboutSnippet() {
  const { school } = useSchool();

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Campus Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/school-campus.jpg"
              alt={`${school?.name || "APS Fatehpur"} Campus`}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Right: Content */}
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--school-primary)" }}
            >
              About Us
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: "var(--text-dark)" }}
            >
              Welcome to {school?.name || "APS Fatehpur"}
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              Established with a vision to provide world-class education,{" "}
              {school?.name || "APS Fatehpur"} has been a beacon of academic
              excellence in the region. Our institution blends modern teaching
              methodologies with strong moral values.
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
              With state-of-the-art infrastructure, experienced faculty, and a
              nurturing environment, we prepare students not just for exams but
              for life. Our alumni network spans across the globe, a testament to
              the quality of education we provide.
            </p>
            <Link
              href="/about"
              className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--school-primary)" }}
            >
              Read More About Us →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
