"use client";

import { PersonPage } from "@/components/shared/PersonPage";

export default function ChairmanPage() {
  return (
    <PersonPage
      role="chairman"
      title="Chairman"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Chairman" },
      ]}
    />
  );
}
