"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function CurriculumPage() {
  return (
    <CmsPage
      slug="curriculum"
      title="Curriculum"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Academy" },
        { label: "Curriculum" },
      ]}
    />
  );
}
