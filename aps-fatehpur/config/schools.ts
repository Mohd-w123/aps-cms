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

export const schools: SchoolConfig[] = [
  {
    id: "apsfatehpur",
    name: "APS Fatehpur (Group)",
    slug: "apsfatehpur",
    domain: "apsfatehpur.com",
    theme: {
      primary: "#499f42",
      primaryDark: "#3d8a37",
      accentYellow: "#d4e96e",
      accentRed: "#C0392B",
      accentBlue: "#9ab5db",
      bg: "#FFFFFF",
      bgLight: "#f6faf5",
      textDark: "#22235b",
      textMuted: "#6B7280",
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
      primary: "#e91e8c",
      primaryDark: "#b5156d",
      accentYellow: "#ffd166",
      accentRed: "#ef476f",
      accentBlue: "#a78bfa",
      bg: "#FFFFFF",
      bgLight: "#fef5fa",
      textDark: "#4a1942",
      textMuted: "#7c6278",
    },
    logo: "/logos/apsfatehpur.png",
    favicon: "/favicons/apsfatehpur.ico",
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
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      accentYellow: "#fbbf24",
      accentRed: "#ef4444",
      accentBlue: "#60a5fa",
      bg: "#FFFFFF",
      bgLight: "#f0f7ff",
      textDark: "#1e293b",
      textMuted: "#64748b",
    },
    logo: "/logos/apsfatehpur.png",
    favicon: "/favicons/apsfatehpur.ico",
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
      primaryDark: "#065f46",
      accentYellow: "#d4a017",
      accentRed: "#b45309",
      accentBlue: "#6ee7b7",
      bg: "#FFFFFF",
      bgLight: "#f0fdf9",
      textDark: "#022c22",
      textMuted: "#4b7c6f",
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
      primaryDark: "#c2410c",
      accentYellow: "#facc15",
      accentRed: "#dc2626",
      accentBlue: "#fdba74",
      bg: "#FFFFFF",
      bgLight: "#fff7ed",
      textDark: "#431407",
      textMuted: "#78716c",
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
