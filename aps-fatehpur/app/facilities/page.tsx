"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function FacilitiesPage() {
  return (
    <CmsPage
      slug="facilities"
      title="Facilities"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Facilities" },
      ]}
    />
  );
}
