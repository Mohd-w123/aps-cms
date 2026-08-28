"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { schools as allSchools } from "@/config/schools";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: "announcement" | "event" | "tour";
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  schoolId?: { _id: string; name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const categories = [
  { label: "All Types", value: "" },
  { label: "Announcements", value: "announcement" },
  { label: "Events", value: "event" },
  { label: "Tours", value: "tour" },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  announcement: "bg-blue-100 text-blue-700",
  event: "bg-green-100 text-green-700",
  tour: "bg-orange-100 text-orange-700",
};

export default function NewsPage() {
  const { slug: schoolSlug } = useSchool();
  const isGroup = schoolSlug === "apsfatehpur";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSchool, setActiveSchool] = useState("all");
  const [page, setPage] = useState(1);

  const branchSchools = allSchools.filter((s) => s.slug !== "apsfatehpur");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "9" });
        if (activeCategory) params.set("category", activeCategory);
        if (isGroup) {
          if (activeSchool !== "all") {
            params.set("school", activeSchool);
          } else {
            params.set("scope", "all");
          }
        }

        const res = await fetch(`/api/news?${params}`, {
          headers: isGroup ? {} : { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) {
          setNews(json.data);
          setPagination(json.pagination);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [schoolSlug, activeCategory, activeSchool, page, isGroup]);

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setPage(1);
  };

  const handleSchoolChange = (value: string) => {
    setActiveSchool(value);
    setPage(1);
  };

  return (
    <>
      <PageBanner
        title="News & Events"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News & Events" }]}
      />
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* School filter tabs (group mode only) */}
          {isGroup && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <button
                onClick={() => handleSchoolChange("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSchool === "all"
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  activeSchool === "all"
                    ? { backgroundColor: "var(--school-primary)" }
                    : undefined
                }
              >
                All Schools
              </button>
              {branchSchools.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSchoolChange(s.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeSchool === s.slug
                      ? "text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    activeSchool === s.slug
                      ? { backgroundColor: s.theme.primary || "var(--school-primary)" }
                      : undefined
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Type filter tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
                style={
                  activeCategory === cat.value
                    ? { backgroundColor: "var(--school-primary)" }
                    : undefined
                }
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-48 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                No news articles found.
              </p>
            </div>
          ) : (
            <>
              {/* News grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                      {item.featuredImage ? (
                        <Image
                          src={item.featuredImage}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-light)" }}
                        >
                          <Calendar className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      {/* School badge in group mode */}
                      {isGroup && item.schoolId && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2.5 py-0.5 bg-black/70 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm">
                            {item.schoolId.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <time
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatDate(item.publishedAt || item.createdAt)}
                        </time>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                            categoryColors[item.category] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <h3
                        className="text-lg font-semibold mb-2 line-clamp-2 group-hover:underline"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm line-clamp-3"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {stripHtml(item.content)}
                      </p>
                      <span
                        className="inline-block mt-auto pt-3 text-sm font-medium"
                        style={{ color: "var(--school-primary)" }}
                      >
                        Read More →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "text-white"
                            : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                        style={
                          p === page
                            ? { backgroundColor: "var(--school-primary)" }
                            : undefined
                        }
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
