"use client";

import Link from "next/link";
import { useSchool } from "@/hooks/useSchool";
import { withSchoolParam } from "@/lib/school-urls";

type SchoolLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function SchoolLink({ href, ...props }: SchoolLinkProps) {
  const { slug } = useSchool();
  return <Link href={withSchoolParam(href, slug)} {...props} />;
}
