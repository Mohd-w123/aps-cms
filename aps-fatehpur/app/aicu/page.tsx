"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { schools as allSchools } from "@/config/schools";
import { School, CheckCircle2, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { getBranchUrl } from "@/lib/school-urls";

interface AICUService {
  name: string;
  description: string;
  icon: string;
}

interface AICUData {
  _id?: string;
  title: string;
  description: string;
  services: AICUService[];
  images: string[];
  schedule?: string;
  schoolId?: { _id: string; name: string; slug: string };
}

export default function AICUPage() {
  const { slug: schoolSlug } = useSchool();
  const isGroup = schoolSlug === "apsfatehpur";

  const [aicu, setAicu] = useState<AICUData | null>(null);
  const [allAicu, setAllAicu] = useState<AICUData[]>([]);
  const [loading, setLoading] = useState(true);

  // In group mode, list the 4 branch schools and default to "all"
  const branchSchools = allSchools.filter((s) => s.slug !== "apsfatehpur");
  const [activeSchoolSlug, setActiveSchoolSlug] = useState<string>("all");

  useEffect(() => {
    async function fetchAICU() {
      setLoading(true);
      try {
        if (isGroup) {
          // Group context: fetch from all schools
          const res = await fetch("/api/aicu?scope=all");
          const json = await res.json();
          if (json.success && json.data) {
            const items = Array.isArray(json.data) ? json.data : [json.data];
            const valid = items.filter((d: AICUData) => d);
            setAllAicu(valid);
          }
        } else {
          // Single school context
          const res = await fetch("/api/aicu", {
            headers: { "x-school-slug": schoolSlug },
          });
          const json = await res.json();
          if (json.success && json.data) {
            setAicu(json.data);
          }
        }
      } catch {
        // not found
      } finally {
        setLoading(false);
      }
    }
    fetchAICU();
  }, [schoolSlug, isGroup]);

  // Current active data for display
  const activeData = isGroup
    ? activeSchoolSlug !== "all"
      ? allAicu.find((d) => d.schoolId?.slug === activeSchoolSlug) || null
      : null
    : aicu;

  const currentSchoolConfig = isGroup && activeSchoolSlug !== "all"
    ? branchSchools.find((s) => s.slug === activeSchoolSlug) || null
    : null;

  return (
    <>
      <PageBanner
        title="AICU (All Institutions Counseling Unit)"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "AICU" },
        ]}
      />

      {/* School switcher tabs for group mode */}
      {isGroup && (
        <section className="bg-white border-b sticky top-0 z-20 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2.5 overflow-x-auto gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-2 flex items-center gap-1.5">
                <School className="h-4 w-4 text-[#499f42]" /> Filter School:
              </span>
              <nav className="flex gap-2 min-w-max">
                <button
                  onClick={() => setActiveSchoolSlug("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSchoolSlug === "all"
                      ? "bg-[#22235b] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 bg-gray-50 border border-gray-200"
                  }`}
                >
                  All Schools ({allAicu.length})
                </button>
                {branchSchools.map((school) => {
                  const hasData = allAicu.some((d) => d.schoolId?.slug === school.slug);
                  const isActive = activeSchoolSlug === school.slug;
                  return (
                    <button
                      key={school.slug}
                      onClick={() => setActiveSchoolSlug(school.slug)}
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
                      {hasData && (
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

      {/* School title banner in filtered single school mode */}
      {isGroup && currentSchoolConfig && (
        <section
          className="py-4 border-b text-white"
          style={{ backgroundColor: currentSchoolConfig.theme.primaryDark || "var(--school-primary-dark, #22235b)" }}
        >
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
                <Image
                  src={currentSchoolConfig.logo}
                  alt={currentSchoolConfig.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-base">{currentSchoolConfig.name}</h2>
                <p className="text-xs text-white/80">AICU Services & Guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSchoolSlug("all")}
                className="text-xs px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                ← View All Schools
              </button>
              <a
                href={getBranchUrl(currentSchoolConfig)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-white text-[#22235b] font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                Visit Site <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>
      )}

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
      ) : isGroup && activeSchoolSlug === "all" ? (
        /* ── ALL SCHOOLS AICU COMBINED VIEW (DEFAULT) ── */
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#499f42] mb-1">
                All Institutions Counseling Unit
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-[#22235b]">
                AICU Programs Across All Schools
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Providing guidance, mentorship, academic support, and student welfare across every institution.
              </p>
            </div>

            <div className="space-y-12">
              {branchSchools.map((school) => {
                const schoolData = allAicu.find((d) => d.schoolId?.slug === school.slug);
                return (
                  <div
                    key={school.slug}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
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
                          onClick={() => setActiveSchoolSlug(school.slug)}
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

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-6">
                      {schoolData ? (
                        <>
                          <h4 className="text-xl font-bold text-[#22235b]">{schoolData.title}</h4>
                          {schoolData.description && (
                            <div
                              className="prose max-w-none text-gray-600 text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: schoolData.description }}
                            />
                          )}

                          {/* Services */}
                          {schoolData.services && schoolData.services.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm text-gray-800 mb-3">Services Offered:</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {schoolData.services.map((srv, idx) => (
                                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                                    <CheckCircle2 className="h-5 w-5 text-[#499f42] shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-[#22235b]">{srv.name}</p>
                                      {srv.description && (
                                        <p className="text-[11px] text-gray-500 mt-0.5">{srv.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Schedule snippet */}
                          {schoolData.schedule && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                              <Clock className="h-4 w-4 shrink-0 text-[#499f42]" />
                              <span><strong>Schedule:</strong> {schoolData.schedule.replace(/<[^>]*>/g, "")}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-6 text-center text-gray-400 text-sm italic">
                          AICU details for {school.name} will be added soon.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : activeData ? (
        /* ── SINGLE SCHOOL FILTERED VIEW ── */
        <>
          {/* Description */}
          <section className="py-12" style={{ backgroundColor: "var(--bg-light)" }}>
            <div className="container mx-auto px-4 max-w-4xl">
              <h2
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
                style={{ color: "var(--text-dark)" }}
              >
                {activeData.title}
              </h2>
              <div
                className="prose prose-lg max-w-none"
                style={{ color: "var(--text-dark)" }}
                dangerouslySetInnerHTML={{ __html: activeData.description }}
              />
            </div>
          </section>

          {/* Services Grid */}
          {activeData.services && activeData.services.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-8 text-center"
                  style={{ color: "var(--text-dark)" }}
                >
                  Our Services & Guidance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeData.services.map((service, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                    >
                      {service.icon ? (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-4"
                          style={{
                            backgroundColor:
                              currentSchoolConfig?.theme.primary || "var(--school-primary)",
                          }}
                        >
                          {service.icon}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700 text-xl mb-4">
                          <CheckCircle2 className="h-6 w-6" />
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
          {activeData.schedule && (
            <section className="py-12" style={{ backgroundColor: "var(--bg-light)" }}>
              <div className="container mx-auto px-4 max-w-4xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2"
                  style={{ color: "var(--text-dark)" }}
                >
                  <Clock className="h-6 w-6 text-[#499f42]" /> Schedule & Timings
                </h3>
                <div
                  className="prose max-w-none"
                  style={{ color: "var(--text-dark)" }}
                  dangerouslySetInnerHTML={{ __html: activeData.schedule }}
                />
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {activeData.images && activeData.images.length > 0 && (
            <section className="py-12">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3
                  className="text-xl md:text-2xl font-bold mb-8 text-center"
                  style={{ color: "var(--text-dark)" }}
                >
                  Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeData.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden relative shadow-sm"
                    >
                      <Image
                        src={img}
                        alt={`AICU ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center max-w-md">
            <School className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              {currentSchoolConfig?.name || "School"} AICU
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              AICU information for this school will be available soon.
            </p>
            <button
              onClick={() => setActiveSchoolSlug("all")}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              ← View All Schools
            </button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        className="py-16 text-center"
        style={{
          backgroundColor:
            currentSchoolConfig?.theme.primary || "var(--school-primary)",
        }}
      >
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Want to know more about AICU counseling?
          </h3>
          <p className="text-white/80 max-w-md mx-auto mb-6 text-sm">
            Get in touch with our counselors and academic advisors for guidance.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full px-8 py-3 text-base font-semibold transition-transform hover:scale-105 shadow-md bg-white text-[#22235b]"
          >
            Contact Us →
          </Link>
        </div>
      </section>
    </>
  );
}
