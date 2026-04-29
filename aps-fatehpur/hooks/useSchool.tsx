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

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState("apsfatehpur");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieSlug = getSlugFromCookie();
    setSlug(cookieSlug);
    setIsLoading(false);
  }, []);

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
