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
              A Legacy of Educational Excellence
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              Founded in 1940 in Fatehpur Shekhawati, Ashraful Uloom Educational
              and Welfare Society emerged as a beacon of hope, dedicated to
              fostering education within an Islamic atmosphere and ideology. This
              visionary initiative was led by the prominent members of society,
              who tirelessly worked towards the upliftment of the Muslim
              community in education, financial stability, social ethics, and
              moral values.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              The journey began with the establishment of Madarsa Islamiya
              Ashraful Uloom, an Islamic education center that served the
              community until 1961. Recognizing the need for modern education
              alongside religious teachings, the society founded Maulana Azad
              Middle School in 1962. This institution grew into a secondary
              school by 1964 and reached the senior secondary level in 1974.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              In response to the growing demand for modern and technical
              education in a global language, the society established Ashraful
              Uloom Public School in 2006. Beginning as an English medium school,
              it progressed to a senior secondary institution in 2016. Today, it
              proudly nurtures over 1,500 young minds, achieving a remarkable
              legacy of 100% results year after year.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              What began as a grassroots movement has now flourished into a
              network of institutions, including separate schools for boys and
              girls and Madarsas offering education in Hindi, English, Urdu, and
              Arabic. The society&apos;s mission remains steadfast: to uplift the
              weaker sections of the community, especially Muslims, through
              education and empowerment.
            </p>
            <p className="text-sm italic mb-8" style={{ color: "var(--text-muted)" }}>
              — Chairman, A.P.S School
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
