"use client";

import { PrincipalPageView } from "@/components/shared/PrincipalPageView";

export default function PrincipalPage() {
  return (
    <PrincipalPageView
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Principal" },
      ]}
    />
  );
}
