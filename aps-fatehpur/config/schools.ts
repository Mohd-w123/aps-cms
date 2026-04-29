export interface SchoolTheme {
  primary: string;
  primaryDark: string;
  accentYellow: string;
  accentRed: string;
  accentBlue: string;
  bg: string;
  bgLight: string;
  textDark: string;
  textMuted: string;
}

export interface SchoolConfig {
  id: string;
  name: string;
  slug: string;
  domain: string;
  theme: SchoolTheme;
  logo: string;
  favicon: string;
  features: string[];
}

const sharedAccents = {
  accentYellow: "#F4D03F",
  accentRed: "#C0392B",
  accentBlue: "#2F3C8F",
  bg: "#FFFFFF",
  bgLight: "#F8F9FA",
  textDark: "#1F2937",
  textMuted: "#6B7280",
};

export const schools: SchoolConfig[] = [
  {
    id: "apsfatehpur",
    name: "APS Fatehpur",
    slug: "apsfatehpur",
    domain: "apsfatehpur.com",
    theme: {
      primary: "#3FA34D",
      primaryDark: "#2d7a38",
      ...sharedAccents,
    },
    logo: "/logos/apsfatehpur.png",
    favicon: "/favicons/apsfatehpur.ico",
    features: [
      "home", "about", "structure", "academy", "facilities",
      "news", "toppers", "aicu", "alumni", "careers", "contact", "apply",
    ],
  },
  {
    id: "apsgirls",
    name: "APS Girls School",
    slug: "apsgirls",
    domain: "apsgirls.apsfatehpur.com",
    theme: {
      primary: "#6b21a8",
      primaryDark: "#3b0764",
      ...sharedAccents,
    },
    logo: "/logos/apsgirls.png",
    favicon: "/favicons/apsgirls.ico",
    features: [
      "home", "about", "structure", "academy", "facilities",
      "news", "toppers", "aicu", "alumni", "careers", "contact", "apply",
    ],
  },
  {
    id: "apsboys",
    name: "APS Boys School",
    slug: "apsboys",
    domain: "apsboys.apsfatehpur.com",
    theme: {
      primary: "#1e40af",
      primaryDark: "#172554",
      ...sharedAccents,
    },
    logo: "/logos/apsboys.png",
    favicon: "/favicons/apsboys.ico",
    features: [
      "home", "about", "structure", "academy", "facilities",
      "news", "toppers", "aicu", "alumni", "careers", "contact", "apply",
    ],
  },
  {
    id: "madrasa",
    name: "Ashrafululum Madrasa",
    slug: "madrasa",
    domain: "madrasa.apsfatehpur.com",
    theme: {
      primary: "#047857",
      primaryDark: "#022c22",
      ...sharedAccents,
    },
    logo: "/logos/madrasa.png",
    favicon: "/favicons/madrasa.ico",
    features: [
      "home", "about", "structure", "academy", "facilities",
      "news", "toppers", "aicu", "alumni", "careers", "contact", "apply",
    ],
  },
  {
    id: "azadschool",
    name: "Azad School",
    slug: "azadschool",
    domain: "azadschool.in",
    theme: {
      primary: "#ea580c",
      primaryDark: "#431407",
      ...sharedAccents,
    },
    logo: "/logos/azadschool.png",
    favicon: "/favicons/azadschool.ico",
    features: [
      "home", "about", "structure", "academy", "facilities",
      "news", "toppers", "aicu", "alumni", "careers", "contact", "apply",
    ],
  },
];

export function getSchoolBySlug(slug: string): SchoolConfig | undefined {
  return schools.find((s) => s.slug === slug);
}

export function getSchoolByDomain(domain: string): SchoolConfig | undefined {
  return schools.find(
    (s) => s.domain === domain || `www.${s.domain}` === domain
  );
}
