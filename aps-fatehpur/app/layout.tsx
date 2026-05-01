import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSchoolBySlug } from "@/config/schools";
import { SchoolProvider } from "@/hooks/useSchool";
import { LayoutShell } from "@/components/layout/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  const theme = school?.theme;

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className="antialiased"
        style={
          theme
            ? ({
                "--school-primary": theme.primary,
                "--school-primary-dark": theme.primaryDark,
                "--accent-yellow": theme.accentYellow,
                "--accent-red": theme.accentRed,
                "--accent-blue": theme.accentBlue,
                "--bg-light": theme.bgLight,
                "--text-dark": theme.textDark,
                "--text-muted": theme.textMuted,
              } as React.CSSProperties)
            : undefined
        }
      >
        <SchoolProvider>
          <LayoutShell>{children}</LayoutShell>
        </SchoolProvider>
      </body>
    </html>
  );
}
