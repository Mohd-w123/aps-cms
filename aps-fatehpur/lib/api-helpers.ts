import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";

/**
 * Get schoolId from the x-school-slug header (set by middleware).
 * Returns the MongoDB _id for the school.
 */
export async function getSchoolId(request: NextRequest): Promise<string | null> {
  const slug = request.headers.get("x-school-slug");
  if (!slug) return null;
  await connectDB();
  const school = await School.findOne({ slug, isActive: true }).select("_id");
  return school?._id?.toString() || null;
}

/**
 * Parse pagination from query params.
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build pagination response object.
 */
export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}

/**
 * Standard success response.
 */
export function successResponse(data: unknown, status = 200, pagination?: ReturnType<typeof paginationMeta>) {
  return Response.json({ success: true, data, ...(pagination && { pagination }) }, { status });
}

/**
 * Standard error response.
 */
export function errorResponse(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}
