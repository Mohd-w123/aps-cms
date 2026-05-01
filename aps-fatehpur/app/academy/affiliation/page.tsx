"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function AffiliationPage() {
  return (
    <CmsPage
      slug="affiliation"
      title="Affiliation"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Academy" },
        { label: "Affiliation" },
      ]}
    />
  );
}
