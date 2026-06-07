import type { Metadata } from "next";
import { Inter, Baloo_2, Nunito } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSchoolBySlug } from "@/config/schools";
import { SchoolProvider } from "@/hooks/useSchool";
import { LayoutShell } from "@/components/layout/LayoutShell";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const slug = headersList.get("x-school-slug") || "apsfatehpur";
  const school = getSchoolBySlug(slug);

  return {
    title: school?.name || "APS girls school fatehpur",
    description: `Welcome to ${school?.name || "APS girls school fatehpur"} — Excellence in Education`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const slug = headersList.get("x-school-slug") || "apsfatehpur";
  const school = getSchoolBySlug(slug);

  // Fetch theme from database (admin-managed colors take priority)
  let dbTheme: Record<string, string> | null = null;
  try {
    await connectDB();
    const dbSchool = await School.findOne({ slug, isActive: true }).select("theme").lean();
    if (dbSchool?.theme) {
      dbTheme = dbSchool.theme as Record<string, string>;
    }
  } catch {
    // Fallback to static config if DB is unavailable
  }

  // Build CSS variables: DB theme (non-empty only) > static config > defaults
  const cssVars: Record<string, string> = {};
  const db = (key: string) => dbTheme?.[key] && dbTheme[key].trim() ? dbTheme[key] : "";
  if (db("primaryColor") || school?.theme.primary) {
    cssVars["--school-primary"] = db("primaryColor") || school?.theme.primary || "#499f42";
    cssVars["--school-primary-dark"] = db("primaryDarkColor") || school?.theme.primaryDark || "#3d8a37";
    cssVars["--accent-yellow"] = db("accentColor") || school?.theme.accentYellow || "#d4e96e";
    cssVars["--accent-blue"] = db("accentBlueColor") || school?.theme.accentBlue || "#9ab5db";
    cssVars["--bg-light"] = db("bgLightColor") || school?.theme.bgLight || "#f6faf5";
    cssVars["--text-dark"] = db("textDarkColor") || school?.theme.textDark || "#22235b";
    cssVars["--text-muted-color"] = db("textMutedColor") || school?.theme.textMuted || "#6B7280";
    cssVars["--brand-secondary"] = db("secondaryColor") || school?.theme.textDark || "#22235b";
    cssVars["--brand-lime"] = db("accentLimeColor") || school?.theme.accentYellow || "#d4e96e";
  }

  return (
    <html lang="en" className={cn("font-sans", inter.variable, baloo2.variable, nunito.variable)}>
      <body
        className="antialiased"
        style={Object.keys(cssVars).length > 0 ? (cssVars as React.CSSProperties) : undefined}
      >
        <SchoolProvider>
          <LayoutShell>{children}</LayoutShell>
        </SchoolProvider>
      </body>
    </html>
  );
}
