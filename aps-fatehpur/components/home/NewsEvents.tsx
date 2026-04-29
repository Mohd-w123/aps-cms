"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

const newsItems = [
  {
    title: "Annual Sports Day 2026",
    date: "May 15, 2026",
    excerpt:
      "Join us for a day of athletic excellence. Students from all sections will compete in various events.",
    slug: "annual-sports-day-2026",
    category: "Event",
  },
  {
    title: "Board Exam Results Announced",
    date: "April 20, 2026",
    excerpt:
      "Congratulations to our students for achieving 100% pass rate in CBSE board examinations.",
    slug: "board-exam-results-2026",
    category: "Announcement",
  },
  {
    title: "Science Exhibition Winners",
    date: "April 10, 2026",
    excerpt:
      "Students showcased innovative projects at the inter-school science exhibition and won multiple awards.",
    slug: "science-exhibition-winners",
    category: "Achievement",
  },
  {
    title: "New Computer Lab Inaugurated",
    date: "March 28, 2026",
    excerpt:
      "State-of-the-art computer lab with 40 workstations inaugurated by the education minister.",
    slug: "new-computer-lab",
    category: "News",
  },
];

export function NewsEvents() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--school-primary)" }}
            >
              Stay Updated
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              News & Events
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "var(--school-primary)" }}
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item) => (
            <article
              key={item.slug}
              className="group rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
            >
              {/* Category header */}
              <div
                className="px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                {item.category}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  <Calendar className="h-3.5 w-3.5" />
                  {item.date}
                </div>
                <h3
                  className="font-semibold text-base mb-2 line-clamp-2"
                  style={{ color: "var(--text-dark)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm line-clamp-3 mb-4" style={{ color: "var(--text-muted)" }}>
                  {item.excerpt}
                </p>
                <Link
                  href={`/news/${item.slug}`}
                  className="text-sm font-semibold hover:opacity-80 transition-colors"
                  style={{ color: "var(--school-primary)" }}
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--school-primary)" }}
          >
            View All News <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
