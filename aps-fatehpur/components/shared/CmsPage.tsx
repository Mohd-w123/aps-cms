"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { schools as allSchools } from "@/config/schools";
import { School, ExternalLink } from "lucide-react";
import { getBranchUrl } from "@/lib/school-urls";

interface CmsPageProps {
  slug: string;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

interface PageData {
  _id?: string;
  title: string;
  content: string;
  featuredImage?: string;
  schoolId?: { _id: string; name: string; slug: string };
}

export function CmsPage({ slug, title, breadcrumbs, children }: CmsPageProps) {
  const { slug: schoolSlug } = useSchool();
  const isGroup = schoolSlug === "apsfatehpur";

  const branchSchools = allSchools.filter((s) => s.slug !== "apsfatehpur");

  const [page, setPage] = useState<PageData | null>(null);
  const [allPages, setAllPages] = useState<PageData[]>([]);
  // Default to "all" in group mode so no single school is forced selected
  const [activeSchool, setActiveSchool] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      try {
        if (isGroup) {
          const res = await fetch(
            `/api/pages?slug=${encodeURIComponent(slug)}&scope=all`
          );
          const json = await res.json();
          if (json.success && json.data) {
            const items: PageData[] = Array.isArray(json.data) ? json.data : [json.data];
            setAllPages(items);
          }
        } else {
          const res = await fetch(
            `/api/pages?slug=${encodeURIComponent(slug)}&school=${schoolSlug}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setPage(json.data);
          }
        }
      } catch {
        // page not found
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug, schoolSlug, isGroup]);

  const activeData = isGroup
    ? activeSchool !== "all"
      ? allPages.find((p) => p.schoolId?.slug === activeSchool) || null
      : null
    : page;

  const currentSchoolConfig = isGroup && activeSchool !== "all"
    ? branchSchools.find((s) => s.slug === activeSchool) || null
    : null;

  const pageTitle =
    title ||
    activeData?.title ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <PageBanner title={pageTitle} breadcrumbs={breadcrumbs} />

      {/* School tabs for group mode */}
      {isGroup && (
        <section className="bg-white border-b sticky top-0 z-20 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2.5 overflow-x-auto gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-2 flex items-center gap-1.5">
                <School className="h-4 w-4 text-[#499f42]" /> Filter School:
              </span>
              <nav className="flex gap-2 min-w-max">
                <button
                  onClick={() => setActiveSchool("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSchool === "all"
                      ? "bg-[#22235b] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 bg-gray-50 border border-gray-200"
                  }`}
                >
                  All Schools ({allPages.length})
                </button>
                {branchSchools.map((school) => {
                  const hasPage = allPages.some((p) => p.schoolId?.slug === school.slug);
                  const isActive = activeSchool === school.slug;
                  return (
                    <button
                      key={school.slug}
                      onClick={() => setActiveSchool(school.slug)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        isActive
                          ? "text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100 bg-gray-50 border border-gray-200"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: school.theme.primary || "var(--school-primary)" }
                          : undefined
                      }
                    >
                      {school.name}
                      {hasPage && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-white" : "bg-[#499f42]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </section>
      )}

      {/* Active single school banner when filtered */}
      {isGroup && currentSchoolConfig && (
        <div className="bg-[#f6faf5] py-3 border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentSchoolConfig.theme.primary || "var(--school-primary)" }}
            >
              {currentSchoolConfig.name}
            </span>
            <button
              onClick={() => setActiveSchool("all")}
              className="text-xs text-gray-500 hover:text-gray-800 underline"
            >
              Show all schools
            </button>
          </div>
        </div>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ) : isGroup && activeSchool === "all" ? (
            /* ── ALL SCHOOLS COMBINED VIEW (DEFAULT) ── */
            <div className="space-y-12">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#499f42] mb-1">
                  Across Our Network
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#22235b]">
                  {pageTitle} Information by School
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  View details for each school in the Ashraful Uloom network below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {branchSchools.map((school) => {
                  const schoolPage = allPages.find((p) => p.schoolId?.slug === school.slug);
                  return (
                    <div
                      key={school.slug}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* School Header Bar */}
                      <div
                        className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white"
                        style={{ backgroundColor: school.theme.primaryDark || "#22235b" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shrink-0">
                            <Image
                              src={school.logo}
                              alt={school.name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{school.name}</h3>
                            <p className="text-xs text-white/80">{school.domain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveSchool(school.slug)}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                          >
                            Focus This School →
                          </button>
                          <a
                            href={getBranchUrl(school)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-full bg-white text-[#22235b] font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                          >
                            Website <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* School Content Body */}
                      <div className="p-6 md:p-8">
                        {schoolPage?.featuredImage && (
                          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-6">
                            <Image
                              src={schoolPage.featuredImage}
                              alt={schoolPage.title || school.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {schoolPage?.content ? (
                          <div
                            className="prose prose-lg max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: schoolPage.content }}
                          />
                        ) : (
                          <div className="py-6 text-center text-gray-400 text-sm italic">
                            Details for {school.name} will be available soon. You can visit their website or contact them directly.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {children}
            </div>
          ) : isGroup ? (
            /* ── GROUP FILTERED VIEW (SINGLE SCHOOL SELECTED) ── */
            activeData?.content ? (
              <div className="max-w-4xl mx-auto space-y-8">
                {activeData.featuredImage && (
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={activeData.featuredImage}
                      alt={activeData.title || pageTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className="prose prose-lg max-w-none"
                  style={{ color: "var(--text-dark)" }}
                  dangerouslySetInnerHTML={{ __html: activeData.content }}
                />
                {children}
              </div>
            ) : (
              <div className="text-center py-16 max-w-md mx-auto">
                <School className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  {currentSchoolConfig?.name || "School"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Content for this page will be available soon for this school.
                </p>
                <button
                  onClick={() => setActiveSchool("all")}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  ← View All Schools
                </button>
              </div>
            )
          ) : (
            /* ── INDIVIDUAL SCHOOL WEBSITE VIEW ── */
            <div className={page?.featuredImage ? "flex flex-col md:flex-row gap-8 items-start" : ""}>
              {page?.featuredImage && (
                <div className="w-full md:w-72 shrink-0">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={page.featuredImage}
                      alt={page.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {page?.content ? (
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
              </div>
              {children}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
