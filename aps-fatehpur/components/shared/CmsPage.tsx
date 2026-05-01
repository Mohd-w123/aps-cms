"use client";

import React, { useEffect, useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";

interface CmsPageProps {
  slug: string;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

interface PageData {
  title: string;
  content: string;
  featuredImage?: string;
}

export function CmsPage({ slug, title, breadcrumbs, children }: CmsPageProps) {
  const { slug: schoolSlug } = useSchool();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/pages?slug=${slug}`, {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPage(json.data);
        }
      } catch {
        // page not found
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug, schoolSlug]);

  const pageTitle = title || page?.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <PageBanner title={pageTitle} breadcrumbs={breadcrumbs} />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ) : page?.content ? (
            <div
              className="prose prose-lg max-w-none"
              style={{ color: "var(--text-dark)" }}
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                Content coming soon...
              </p>
            </div>
          )}
          {children}
        </div>
      </section>
    </>
  );
}
