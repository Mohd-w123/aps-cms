"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSchool } from "@/hooks/useSchool";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { slug } = useSchool();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolParam = searchParams.get("school");
  const isFirstNav = useRef(true);
  const prevSchoolParam = useRef(schoolParam);

  // Re-fetch server layout when ?school= changes so <html> theme vars update on client nav
  useEffect(() => {
    if (isFirstNav.current) {
      isFirstNav.current = false;
      prevSchoolParam.current = schoolParam;
      return;
    }
    if (schoolParam !== prevSchoolParam.current) {
      prevSchoolParam.current = schoolParam;
      router.refresh();
    }
  }, [pathname, schoolParam, router]);

  // Hide Header/Footer when showing group landing (root path without ?school) or admin panel routes
  const isRootPath = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const isGroupLanding = isRootPath && !schoolParam;
  const hideChrome = isAdminRoute || isGroupLanding || (slug === "apsfatehpur" && isRootPath);

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden" suppressHydrationWarning>
      {!hideChrome && <Header />}
      <main className="flex-1 w-full max-w-full overflow-x-hidden" suppressHydrationWarning>{children}</main>
      {!hideChrome && <Footer />}
      <div id="global_google_translate_element" className="hidden" suppressHydrationWarning />
    </div>
  );
}
