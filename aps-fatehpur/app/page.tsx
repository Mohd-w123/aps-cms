"use client";

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
