"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";

interface AICUData {
  title: string;
  description: string;
  services: { name: string; description: string; icon: string }[];
  images: string[];
  schedule?: string;
}

export default function AICUPage() {
  const { slug: schoolSlug } = useSchool();
  const [aicu, setAicu] = useState<AICUData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAICU() {
      try {
        const res = await fetch("/api/aicu", {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setAicu(json.data);
        }
      } catch {
        // not found
      } finally {
        setLoading(false);
      }
    }
    fetchAICU();
  }, [schoolSlug]);

  return (
    <>
      <PageBanner
        title="AICU"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "AICU" },
        ]}
      />

      {loading ? (
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-5xl space-y-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      ) : aicu ? (
        <>
          {/* Description */}
          <section className="py-12" style={{ backgroundColor: "var(--bg-light)" }}>
            <div className="container mx-auto px-4 max-w-4xl">
              <h2
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
                style={{ color: "var(--text-dark)" }}
              >
                {aicu.title}
              </h2>
              <div
                className="prose prose-lg max-w-none"
                style={{ color: "var(--text-dark)" }}
                dangerouslySetInnerHTML={{ __html: aicu.description }}
              />
            </div>
          </section>

          {/* Services Grid */}
          {aicu.services.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-8 text-center"
                  style={{ color: "var(--text-dark)" }}
                >
                  Our Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aicu.services.map((service, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      {service.icon && (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-4"
                          style={{ backgroundColor: "var(--school-primary)" }}
                        >
                          {service.icon}
                        </div>
                      )}
                      <h4
                        className="text-lg font-semibold mb-2"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {service.name}
                      </h4>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Schedule */}
          {aicu.schedule && (
            <section className="py-12" style={{ backgroundColor: "var(--bg-light)" }}>
              <div className="container mx-auto px-4 max-w-4xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-4 text-center"
                  style={{ color: "var(--text-dark)" }}
                >
                  Schedule
                </h3>
                <div
                  className="prose max-w-none"
                  style={{ color: "var(--text-dark)" }}
                  dangerouslySetInnerHTML={{ __html: aicu.schedule }}
                />
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {aicu.images.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-8 text-center"
                  style={{ color: "var(--text-dark)" }}
                >
                  Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {aicu.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`AICU ${i + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section
            className="py-16 text-center"
            style={{ backgroundColor: "var(--school-primary)" }}
          >
            <div className="container mx-auto px-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Want to know more about AICU?
              </h3>
              <Link
                href="/contact"
                className="inline-block rounded-full px-8 py-3 text-lg font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: "#fff",
                  color: "var(--school-primary)",
                }}
              >
                Contact Us →
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              Content coming soon...
            </p>
          </div>
        </section>
      )}
    </>
  );
}
