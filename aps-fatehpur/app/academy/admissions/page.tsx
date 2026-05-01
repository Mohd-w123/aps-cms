"use client";

import Link from "next/link";
import { CmsPage } from "@/components/shared/CmsPage";

export default function AdmissionsPage() {
  return (
    <CmsPage
      slug="admissions"
      title="Admissions"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Academy" },
        { label: "Admissions" },
      ]}
    >
      <div className="mt-10 text-center">
        <Link
          href="/apply"
          className="inline-block rounded-full px-8 py-3 text-lg font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: "var(--school-primary)" }}
        >
          Apply Online →
        </Link>
      </div>
    </CmsPage>
  );
}
