"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PlayfulSection, SectionHeader, BlobDecoration } from "@/components/shared/PlayfulUI";

const defaultContent = `<p>Founded in 1940 in Fatehpur Shekhawati, Ashraful Uloom Educational and Welfare Society emerged as a beacon of hope, dedicated to fostering education within an Islamic atmosphere and ideology.</p><p>The journey began with the establishment of Madarsa Islamiya Ashraful Uloom, an Islamic education center. Recognizing the need for modern education alongside religious teachings, the society founded Maulana Azad Middle School in 1962.</p><p>In 2006, the society established Ashraful Uloom Public School. Today, it proudly nurtures over 1,500 young minds, achieving a remarkable legacy of 100% results year after year.</p>`;

export function AboutSnippet() {
  const { school } = useSchool();
  const [content, setContent] = useState(defaultContent);
  const [title, setTitle] = useState("About Us");
  const [image, setImage] = useState("/images/school-campus.jpg");
  const [signoff, setSignoff] = useState("");
  const [aboutHref, setAboutHref] = useState("/about");

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
            // seo.metaTitle stores the custom Read More URL
            if (aboutPage.seo?.metaTitle) setAboutHref(aboutPage.seo.metaTitle);
            else if (aboutPage.slug) setAboutHref(`/${aboutPage.slug}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <PlayfulSection className="py-20" style={{ backgroundColor: "var(--bg-light, #f6faf5)" }} blobs floatingIcons>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Campus Image */}
          <div className="relative">
            <BlobDecoration className="absolute -top-8 -left-8 w-40 h-40 opacity-20 animate-float-slow" style={{ color: "var(--accent-blue, #9ab5db)" }} />
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={image}
                alt={`${school?.name || "APS Fatehpur"} Campus`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <SectionHeader label="About Us" title={title} emoji="🏫" align="left" />
            <div
              className="text-base leading-relaxed mb-8 prose prose-gray max-w-none"
              style={{ color: "var(--text-muted-color)" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {signoff && (
              <p className="text-sm italic mb-6 text-gray-500">
                {signoff}
              </p>
            )}
            <Link
              href={aboutHref}
              className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: "var(--school-primary, #499f42)" }}
            >
              Read More About Us →
            </Link>
          </div>
        </div>
      </div>
    </PlayfulSection>
  );
}
