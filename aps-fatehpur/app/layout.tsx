import type { Metadata } from "next";
import { Inter, Baloo_2, Nunito } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSchoolBySlug } from "@/config/schools";
import { SchoolProvider } from "@/hooks/useSchool";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { buildThemeCssVars } from "@/lib/theme";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const slug = headersList.get("x-school-slug") || "apsfatehpur";
  const school = getSchoolBySlug(slug);
  const cssVars = buildThemeCssVars(school, null);

  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable, baloo2.variable, nunito.variable)}
      style={Object.keys(cssVars).length > 0 ? (cssVars as React.CSSProperties) : undefined}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <SchoolProvider initialSlug={slug}>
          <LayoutShell>{children}</LayoutShell>
        </SchoolProvider>
      </body>
    </html>
  );
}
