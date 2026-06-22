"use client";

import { useParams } from "next/navigation";
import { CmsPage } from "@/components/shared/CmsPage";

export default function DynamicCmsPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <CmsPage
      slug={slug}
      breadcrumbs={[{ label: "Home", href: "/" }]}
    />
  );
}
