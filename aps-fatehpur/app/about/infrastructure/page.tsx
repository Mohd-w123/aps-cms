"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function InfrastructurePage() {
  return (
    <CmsPage
      slug="infrastructure"
      title="Infrastructure"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Infrastructure" },
      ]}
    />
  );
}
