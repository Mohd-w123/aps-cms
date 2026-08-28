"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SchoolConfig, getSchoolBySlug } from "@/config/schools";

interface SchoolContextValue {
  school: SchoolConfig | null;
  slug: string;
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextValue>({
  school: null,
  slug: "apsfatehpur",
  isLoading: true,
});

function getSlugFromCookie(): string {
  if (typeof document === "undefined") return "apsfatehpur";
  const match = document.cookie.match(/school-slug=([^;]+)/);
  return match?.[1] || "apsfatehpur";
}

export function SchoolProvider({
  children,
  initialSlug = "apsfatehpur",
}: {
  children: React.ReactNode;
  initialSlug?: string;
}) {
  const pathname = usePathname();
  const [slug, setSlug] = useState(initialSlug);
  const [isLoading, setIsLoading] = useState(false);

  // Keep slug in sync on client navigations — theme is server-rendered only (no client overrides).
  useEffect(() => {
    const paramSlug = new URLSearchParams(window.location.search).get("school");
    const cookieSlug = getSlugFromCookie();
    // Prefer: explicit ?school= param > cookie > keep server-provided initialSlug
    // Never downgrade to "apsfatehpur" if the server already gave a specific school slug
    const resolved = paramSlug || cookieSlug || initialSlug;
    setSlug((current) => (resolved && resolved !== current ? resolved : current));
  }, [pathname, initialSlug]);

  const school = getSchoolBySlug(slug) || null;

  return (
    <SchoolContext.Provider value={{ school, slug, isLoading }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
}
