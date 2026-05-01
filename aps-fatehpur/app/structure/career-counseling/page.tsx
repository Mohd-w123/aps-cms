"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function CareerCounselingPage() {
  return (
    <CmsPage
      slug="career-counseling"
      title="Career Counseling"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Structure" },
        { label: "Career Counseling" },
      ]}
    />
  );
}
