"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function FeesPage() {
  return (
    <CmsPage
      slug="fees"
      title="Fee Structure"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Academy" },
        { label: "Fees" },
      ]}
    />
  );
}
