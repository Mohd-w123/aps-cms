"use client";

import { CmsPage } from "@/components/shared/CmsPage";

export default function UniformsPage() {
  return (
    <CmsPage
      slug="uniforms"
      title="Uniforms"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Structure" },
        { label: "Uniforms" },
      ]}
    />
  );
}
