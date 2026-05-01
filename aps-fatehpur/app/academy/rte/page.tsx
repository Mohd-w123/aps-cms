"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function RTEPage() {
  return (
    <CmsPage
      slug="rte"
      title="Right to Education (RTE)"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Academy" },
        { label: "RTE" },
      ]}
    />
  );
}
