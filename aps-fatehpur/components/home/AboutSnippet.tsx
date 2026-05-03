"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";

const defaultContent = `<p>Founded in 1940 in Fatehpur Shekhawati, Ashraful Uloom Educational and Welfare Society emerged as a beacon of hope, dedicated to fostering education within an Islamic atmosphere and ideology.</p><p>The journey began with the establishment of Madarsa Islamiya Ashraful Uloom, an Islamic education center. Recognizing the need for modern education alongside religious teachings, the society founded Maulana Azad Middle School in 1962.</p><p>In 2006, the society established Ashraful Uloom Public School. Today, it proudly nurtures over 1,500 young minds, achieving a remarkable legacy of 100% results year after year.</p>`;

export function AboutSnippet() {
  const { school } = useSchool();
  const [content, setContent] = useState(defaultContent);
  const [title, setTitle] = useState("About Us");
  const [image, setImage] = useState("/images/school-campus.jpg");
  const [signoff, setSignoff] = useState("");

  useEffect(() => {
    fetch("/api/pages?limit=50")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const aboutPage = r.data.find((p: { slug: string }) => p.slug === "home-about" || p.slug === "about");
          if (aboutPage) {
            if (aboutPage.title) setTitle(aboutPage.title);
            if (aboutPage.content) setContent(aboutPage.content);
            if (aboutPage.featuredImage) setImage(aboutPage.featuredImage);
            if (aboutPage.seo?.metaDescription) setSignoff(aboutPage.seo.metaDescription);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-light)" }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Campus Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src={image}
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
              {title}
            </h2>
            <div
              className="text-base leading-relaxed mb-8 prose prose-gray max-w-none"
              style={{ color: "var(--text-muted)" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {signoff && (
              <p className="text-sm italic mb-6" style={{ color: "var(--text-muted)" }}>
                {signoff}
              </p>
            )}
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
