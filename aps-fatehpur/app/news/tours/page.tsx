"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function ToursPage() {
  return (
    <CmsPage
      slug="tours"
      title="Tours & Excursions"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "News", href: "/news" },
        { label: "Tours" },
      ]}
    />
  );
}
