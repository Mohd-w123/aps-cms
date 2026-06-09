/** True on localhost or Vercel preview hosts where ?school= is used */
export function isDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host.includes("vercel.app");
}

/** Append ?school=slug to internal paths on dev hosts (branch schools only) */
export function withSchoolParam(href: string, slug: string): string {
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("/admin")
  ) {
    return href;
  }
  if (slug === "apsfatehpur" || !isDevHost()) {
    return href;
  }
  const [path, queryString] = href.split("?");
  const params = new URLSearchParams(queryString || "");
  params.set("school", slug);
  return `${path}?${params.toString()}`;
}

/** Home URL for a school site (uses ?school= on dev hosts for branch schools) */
export function getSchoolHomeUrl(slug: string): string {
  return withSchoolParam("/", slug);
}

/** External or dev URL for a branch school card/link */
export function getBranchUrl(school: {
  slug: string;
  domain?: string;
  websiteUrl?: string;
}): string {
  if (school.websiteUrl) return school.websiteUrl;
  if (typeof window !== "undefined" && isDevHost()) {
    return withSchoolParam("/", school.slug);
  }
  return school.domain ? `https://${school.domain}` : withSchoolParam("/", school.slug);
}

/** Navigate to school home, reloading when already on that page */
export function navigateToSchoolHome(slug: string): void {
  const home = getSchoolHomeUrl(slug);
  const current = window.location.pathname + window.location.search;
  if (current === home) {
    window.location.reload();
  } else {
    window.location.href = home;
  }
}
