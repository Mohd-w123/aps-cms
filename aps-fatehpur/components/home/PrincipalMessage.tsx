"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { usePrincipal } from "@/hooks/usePrincipal";
import { SchoolLink } from "@/components/shared/SchoolLink";
import { PlayfulSection, BlobDecoration } from "@/components/shared/PlayfulUI";
import { isPrincipalPreviewTruncated } from "@/lib/utils";

export function PrincipalMessage() {
  const { content, loading } = usePrincipal();

  const showReadMore = useMemo(
    () => (content?.bio ? isPrincipalPreviewTruncated(content.bio) : false),
    [content?.bio]
  );

  if (loading || !content) return null;

  const designation = content.designation || "Principal";
  return (
    <PlayfulSection className="py-20 bg-white" blobs>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Principal Photo */}
            <div className="flex flex-col items-center text-center relative">
              <BlobDecoration className="absolute -top-6 -left-6 w-32 h-32 opacity-30 animate-float-slow" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
              <div className="w-48 h-48 rounded-full overflow-hidden mb-4 shadow-xl" style={{ outline: "4px solid var(--school-primary, #499f42)", outlineOffset: "2px" }}>
                <Image
                  src={content.photo || "/images/principal.jpg"}
                  alt={`${content.name} - ${designation}`}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-dark, #22235b)" }}>
                {content.name}
              </h3>
              <p className="text-sm text-gray-500">
                {designation}
              </p>
            </div>

            {/* Message preview — max 5 lines; full message on /about/principal */}
            <div className="relative">
              <Quote className="h-10 w-10 mb-4 opacity-30" style={{ color: "var(--school-primary, #499f42)" }} />
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-dark, #22235b)" }}>
                {designation}&apos;s Message
              </h2>
              <div
                className="text-base leading-relaxed prose prose-gray max-w-none line-clamp-5"
                style={{ color: "var(--text-muted-color)" }}
                dangerouslySetInnerHTML={{ __html: content.bio }}
              />
              {showReadMore && (
                <SchoolLink
                  href="/about/principal"
                  className="inline-block mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: "var(--school-primary, #499f42)" }}
                >
                  Read Full Message →
                </SchoolLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </PlayfulSection>
  );
}
