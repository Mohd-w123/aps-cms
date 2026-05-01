"use client";

import { PersonPage } from "@/components/shared/PersonPage";

export default function DirectorPage() {
  return (
    <PersonPage
      role="director"
      title="Director"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Director" },
      ]}
    />
  );
}
