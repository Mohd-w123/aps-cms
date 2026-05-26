"use client";

import { useSearchParams } from "next/navigation";
import { useSchool } from "@/hooks/useSchool";
import { GroupLanding } from "@/components/home/GroupLanding";
import {
  HeroCarousel,
  RunningNotice,
  QuickStats,
  AboutSnippet,
  PrincipalMessage,
  FeaturesGrid,
  NewsEvents,
  ToppersCarousel,
  GalleryPreview,
  TestimonialsSlider,
  CTABanner,
} from "@/components/home";
import { CursorTrail } from "@/components/shared/PlayfulUI";

export default function HomePage() {
  const { slug, isLoading } = useSchool();
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get("school");

  if (isLoading) return null;

  // On localhost: show group landing when no ?school= param,
  // even if cookie says otherwise (client-side nav doesn't re-run middleware)
  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
  const showGroupLanding = isLocalhost ? !schoolParam : slug === "apsfatehpur";

  if (showGroupLanding) {
    return <GroupLanding />;
  }

  // Individual school home page
  return (
    <>
      <CursorTrail />
      <HeroCarousel />
      <RunningNotice />
      <QuickStats />
      <AboutSnippet />
      <PrincipalMessage />
      <FeaturesGrid />
      <NewsEvents />
      <ToppersCarousel />
      <GalleryPreview />
      <TestimonialsSlider />
      <CTABanner />
    </>
  );
}
