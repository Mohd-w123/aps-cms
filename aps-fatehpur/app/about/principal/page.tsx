"use client";

import { PersonPage } from "@/components/shared/PersonPage";

export default function PrincipalPage() {
  return (
    <PersonPage
      role="principal"
      title="Principal"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Principal" },
      ]}
    />
  );
}
