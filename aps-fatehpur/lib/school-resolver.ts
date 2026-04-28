import { headers } from "next/headers";
import { getSchoolBySlug, SchoolConfig } from "@/config/schools";

/**
 * Server-side: resolve current school from request headers (set by middleware)
 */
export function getSchoolSlugFromHeaders(): string {
  const headersList = headers();
  return headersList.get("x-school-slug") || "apsfatehpur";
}

/**
 * Server-side: get full school config from headers
 */
export function getSchoolFromHeaders(): SchoolConfig {
  const slug = getSchoolSlugFromHeaders();
  return getSchoolBySlug(slug) || getSchoolBySlug("apsfatehpur")!;
}

/**
 * Client-side: read school slug from cookie
 */
export function getSchoolSlugFromCookie(): string {
  if (typeof document === "undefined") return "apsfatehpur";
  const match = document.cookie.match(/school-slug=([^;]+)/);
  return match?.[1] || "apsfatehpur";
}
