"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";

interface PersonData {
  name: string;
  designation: string;
  bio: string;
  photo?: string;
  qualifications?: string;
}

interface PersonPageProps {
  role: "director" | "chairman" | "principal";
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PersonPage({ role, title, breadcrumbs }: PersonPageProps) {
  const { slug: schoolSlug } = useSchool();
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerson() {
      try {
        const res = await fetch(`/api/persons?role=${role}`, {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setPerson(json.data[0]);
        }
      } catch {
        // not found
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [role, schoolSlug]);

  return (
    <>
      <PageBanner title={title} breadcrumbs={breadcrumbs} />
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
          ) : person ? (
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Photo */}
              {person.photo && (
                <div className="w-64 flex-shrink-0">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    width={256}
                    height={320}
                    className="w-full rounded-xl shadow-lg object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h2
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: "var(--text-dark)" }}
                >
                  {person.name}
                </h2>
                <p
                  className="text-lg font-medium mb-1"
                  style={{ color: "var(--school-primary)" }}
                >
                  {person.designation}
                </p>
                {person.qualifications && (
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    {person.qualifications}
                  </p>
                )}
                <div
                  className="prose prose-lg max-w-none mt-4"
                  style={{ color: "var(--text-dark)" }}
                  dangerouslySetInnerHTML={{ __html: person.bio }}
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
