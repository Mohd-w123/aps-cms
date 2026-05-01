"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSchool } from "@/hooks/useSchool";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { slug } = useSchool();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    setIsLocalhost(window.location.hostname === "localhost");
  }, []);

  // Hide Header/Footer when showing group landing:
  // - On production: slug is "apsfatehpur" (hostname-based)
  // - On localhost: root path "/" without ?school= param
  const isRootPath = pathname === "/";
  const hideChrome = isLocalhost
    ? isRootPath && !schoolParam
    : slug === "apsfatehpur";

  return (
    <>
      {!hideChrome && <Header />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
