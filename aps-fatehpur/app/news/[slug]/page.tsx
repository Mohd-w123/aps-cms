"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { Calendar, ArrowLeft } from "lucide-react";

interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  featuredImage?: string;
  images?: string[];
  publishedAt?: string;
  createdAt: string;
}

interface RelatedNews {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  category: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  announcement: "bg-blue-100 text-blue-700",
  event: "bg-green-100 text-green-700",
  tour: "bg-orange-100 text-orange-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { slug: schoolSlug } = useSchool();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [related, setRelated] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      setLoading(true);
      try {
        const res = await fetch(`/api/news/${slug}`, {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setArticle(json.data);

          // Fetch related news (same category, limit 3)
          const relRes = await fetch(
            `/api/news?category=${json.data.category}&limit=4`,
            { headers: { "x-school-slug": schoolSlug } }
          );
          const relJson = await relRes.json();
          if (relJson.success) {
            setRelated(
              relJson.data
                .filter((n: RelatedNews) => n._id !== json.data._id)
                .slice(0, 3)
            );
          }
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug, schoolSlug]);

  if (loading) {
    return (
      <>
        <PageBanner title="Loading..." />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <PageBanner title="Article Not Found" />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg mb-6" style={{ color: "var(--text-muted)" }}>
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--school-primary)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={article.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: article.title },
        ]}
      />
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Meta */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedAt || article.createdAt)}
            </div>
            <span
              className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                categoryColors[article.category] || "bg-gray-100 text-gray-600"
              }`}
            >
              {article.category}
            </span>
          </div>

          {/* Featured image */}
          {article.featuredImage && (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 shadow-sm">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            style={{ color: "var(--text-dark)" }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Additional images */}
          {article.images && article.images.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
                Photos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {article.images.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: "var(--school-primary)" }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to all news
            </Link>
          </div>
        </div>
      </article>

      {/* Related news */}
      {related.length > 0 && (
        <section className="py-12 border-t" style={{ backgroundColor: "var(--bg-light)" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h3 className="text-2xl font-bold mb-6" style={{ color: "var(--text-dark)" }}>
              Related News
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/news/${item.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
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
                        <Calendar className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <time className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(item.createdAt)}
                    </time>
                    <h4
                      className="text-sm font-semibold mt-1 line-clamp-2 group-hover:underline"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
