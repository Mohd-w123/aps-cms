"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function AboutPage() {
  return (
    <CmsPage
      slug="about"
      title="About Us"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About Us" },
      ]}
    />
  );
}
