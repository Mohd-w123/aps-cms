"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function BusRoutesPage() {
  return (
    <CmsPage
      slug="bus-routes"
      title="Bus Routes"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Structure" },
        { label: "Bus Routes" },
      ]}
    />
  );
}
