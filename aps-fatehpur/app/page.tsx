"use client";

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

export default function HomePage() {
  const { slug, isLoading } = useSchool();

  if (isLoading) return null;

  // Group landing page — shows 4 school cards
  if (slug === "apsfatehpur") {
    return <GroupLanding />;
  }

  // Individual school home page
  return (
    <>
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
