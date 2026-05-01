"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function AwardsPage() {
  return (
    <CmsPage
      slug="awards"
      title="Awards & Achievements"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Structure" },
        { label: "Awards" },
      ]}
    />
  );
}
