"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

/** Applies CSS variables on document.body for the given school theme */
function applyThemeVars(school: SchoolConfig | null) {
  if (typeof document === "undefined" || !school) return;
  const body = document.body;
  const t = school.theme;
  body.style.setProperty("--school-primary", t.primary);
  body.style.setProperty("--school-primary-dark", t.primaryDark);
  body.style.setProperty("--accent-yellow", t.accentYellow);
  body.style.setProperty("--accent-blue", t.accentBlue);
  body.style.setProperty("--bg-light", t.bgLight);
  body.style.setProperty("--text-dark", t.textDark);
  body.style.setProperty("--text-muted-color", t.textMuted);
  body.style.setProperty("--brand-secondary", t.textDark);
  body.style.setProperty("--brand-lime", t.accentYellow);
}

/** Fetch DB theme and apply overrides (admin-managed colors take priority) */
function fetchAndApplyDbTheme(slug: string, staticTheme: SchoolConfig["theme"]) {
  if (typeof window === "undefined") return;
  fetch("/api/schools")
    .then((r) => r.json())
    .then((r) => {
      if (!r.success || !r.data) return;
      const arr = Array.isArray(r.data) ? r.data : [r.data];
      const s = arr.find((sc: { slug: string }) => sc.slug === slug);
      if (s?.theme) {
        const body = document.body;
        const t = s.theme;
        // Only apply non-empty DB values (empty = not set by admin, use static config)
        if (t.primaryColor?.trim()) body.style.setProperty("--school-primary", t.primaryColor);
        if (t.primaryDarkColor?.trim()) body.style.setProperty("--school-primary-dark", t.primaryDarkColor);
        if (t.accentColor?.trim()) body.style.setProperty("--accent-yellow", t.accentColor);
        if (t.accentBlueColor?.trim()) body.style.setProperty("--accent-blue", t.accentBlueColor);
        if (t.bgLightColor?.trim()) body.style.setProperty("--bg-light", t.bgLightColor);
        if (t.textDarkColor?.trim()) body.style.setProperty("--text-dark", t.textDarkColor);
        if (t.textMutedColor?.trim()) body.style.setProperty("--text-muted-color", t.textMutedColor);
        if (t.secondaryColor?.trim()) body.style.setProperty("--brand-secondary", t.secondaryColor);
        if (t.accentLimeColor?.trim()) body.style.setProperty("--brand-lime", t.accentLimeColor);
      }
    })
    .catch(() => {});
}

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState("apsfatehpur");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieSlug = getSlugFromCookie();
    setSlug(cookieSlug);
    setIsLoading(false);
  }, []);

  const school = getSchoolBySlug(slug) || null;

  // Client-side theme sync: always apply CSS vars based on current school
  useEffect(() => {
    if (school) {
      // First apply static config immediately (no flash)
      applyThemeVars(school);
      // Then fetch DB overrides (admin-managed colors) and apply on top
      fetchAndApplyDbTheme(slug, school.theme);
    }
  }, [school, slug]);

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
