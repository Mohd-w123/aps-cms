"use client";

import React from "react";
import { Quote } from "lucide-react";

export function PrincipalMessage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Principal Photo */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-48 h-48 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                  👤
                </div>
              </div>
              <h3
                className="font-bold text-lg"
                style={{ color: "var(--text-dark)" }}
              >
                Dr. Principal Name
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Principal
              </p>
            </div>

            {/* Message */}
            <div className="relative">
              <Quote
                className="h-10 w-10 mb-4 opacity-20"
                style={{ color: "var(--school-primary)" }}
              />
              <h2
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ color: "var(--text-dark)" }}
              >
                Principal&apos;s Message
              </h2>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                &ldquo;Education is not just about academics — it is about
                building character, instilling values, and preparing young minds
                to face the challenges of tomorrow. At our school, every child
                is valued and nurtured to reach their fullest potential.&rdquo;
              </p>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                &ldquo;We believe in holistic development — academics, sports,
                arts, and community service — all play an integral role in
                shaping well-rounded individuals. I invite parents and students
                to join our family and experience a journey of growth and
                discovery.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
