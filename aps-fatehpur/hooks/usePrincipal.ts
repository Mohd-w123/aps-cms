"use client";

import { useEffect, useState } from "react";
import { useSchool } from "@/hooks/useSchool";

export const PRINCIPAL_PAGE_SLUG = "about/principal";

export interface PrincipalContent {
  name: string;
  designation: string;
  bio: string;
  photo?: string;
  qualifications?: string;
}

export function usePrincipal() {
  const { slug } = useSchool();
  const [content, setContent] = useState<PrincipalContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || slug === "apsfatehpur") {
      setContent(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const pageRes = await fetch(
          `/api/pages?slug=${encodeURIComponent(PRINCIPAL_PAGE_SLUG)}&school=${slug}`
        );
        const pageJson = await pageRes.json();
        if (!cancelled && pageJson.success && pageJson.data?.content) {
          const page = pageJson.data;
          setContent({
            name: page.seo?.metaTitle || page.title || "Principal",
            designation: page.seo?.metaDescription || "Principal",
            bio: page.content,
            photo: page.featuredImage,
          });
          return;
        }

        const personRes = await fetch(`/api/persons?role=principal&school=${slug}`);
        const personJson = await personRes.json();
        if (!cancelled && personJson.success && personJson.data?.length > 0) {
          const person = personJson.data[0];
          setContent({
            name: person.name,
            designation: person.designation || "Principal",
            bio: person.bio || "",
            photo: person.photo,
            qualifications: person.qualifications,
          });
          return;
        }

        if (!cancelled) setContent(null);
      } catch {
        if (!cancelled) setContent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { content, loading, slug };
}
