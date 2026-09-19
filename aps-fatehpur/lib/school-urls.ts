/** True on localhost or Vercel preview hosts where ?school= is used */
export function isDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host.includes("vercel.app");
}

/** Append ?school=slug to internal paths for branch schools */
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
  if (slug === "apsfatehpur") {
    return href;
  }
  const [path, queryString] = href.split("?");
  const params = new URLSearchParams(queryString || "");
  params.set("school", slug);
  return `${path}?${params.toString()}`;
}

/** Home URL for a school site */
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
  // If it is an external custom domain like azadschool.in, link to it directly
  if (school.domain && !school.domain.includes("apsfatehpur.com")) {
    return `https://${school.domain}`;
  }
  // For branch schools on apsfatehpur.com, route via ?school=slug so it opens the school site immediately
  return withSchoolParam("/", school.slug);
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
