import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/shared/CmsPage";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";
import Page from "@/lib/models/Page";

export default async function DynamicCmsPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageSlug = params.slug;

  const headersList = headers();
  const schoolSlug = headersList.get("x-school-slug") || "apsfatehpur";

  await connectDB();
  const school = await School.findOne({ slug: schoolSlug, isActive: true }).select("_id").lean();
  if (!school?._id) notFound();

  const page = await Page.findOne({ schoolId: school._id, slug: pageSlug, isPublished: true })
    .select("_id")
    .lean();
  if (!page?._id) notFound();

  return (
    <CmsPage
      slug={pageSlug}
      breadcrumbs={[{ label: "Home", href: "/" }]}
    />
  );
}
