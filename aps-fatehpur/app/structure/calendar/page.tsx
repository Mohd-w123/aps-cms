"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function CalendarPage() {
  return (
    <CmsPage
      slug="calendar"
      title="Academic Calendar"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Structure" },
        { label: "Calendar" },
      ]}
    />
  );
}
