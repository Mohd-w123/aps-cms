export interface SchoolRef {
  _id: string;
  name: string;
  slug: string;
}

export function getSchoolName(
  schoolId?: SchoolRef | string | null,
  schoolName?: string | null
): string {
  if (schoolName) return schoolName;
  if (!schoolId || typeof schoolId === "string") return "—";
  return schoolId.name || schoolId.slug || "—";
}

/** Attach schoolName from populated schoolId for API responses. */
export function withSchoolName(items: unknown[]) {
  return items.map((item) => {
    const doc = item as { toObject?: () => Record<string, unknown> };
    const plain =
      doc && typeof doc.toObject === "function" ? doc.toObject() : (item as Record<string, unknown>);
    const school = plain.schoolId as SchoolRef | string | undefined;
    const schoolName =
      school && typeof school === "object" ? school.name || school.slug : undefined;
    return { ...plain, schoolName };
  });
}
