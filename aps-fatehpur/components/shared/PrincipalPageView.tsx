"use client";

import React from "react";
import Image from "next/image";
import { usePrincipal } from "@/hooks/usePrincipal";
import { PageBanner } from "@/components/layout/PageBanner";

interface PrincipalPageViewProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function PrincipalPageView({ breadcrumbs }: PrincipalPageViewProps) {
  const { content, loading } = usePrincipal();

  return (
    <>
      <PageBanner title="Principal" breadcrumbs={breadcrumbs} />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="flex flex-col md:flex-row gap-8 animate-pulse">
              <div className="w-64 h-72 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ) : content ? (
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {content.photo && (
                <div className="w-64 flex-shrink-0">
                  <Image
                    src={content.photo}
                    alt={content.name}
                    width={256}
                    height={320}
                    className="w-full rounded-xl shadow-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: "var(--text-dark)" }}
                >
                  {content.name}
                </h2>
                <p
                  className="text-lg font-medium mb-1"
                  style={{ color: "var(--school-primary)" }}
                >
                  {content.designation}
                </p>
                {content.qualifications && (
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    {content.qualifications}
                  </p>
                )}
                <div
                  className="prose prose-lg max-w-none mt-4"
                  style={{ color: "var(--text-dark)" }}
                  dangerouslySetInnerHTML={{ __html: content.bio }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                Content coming soon...
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
