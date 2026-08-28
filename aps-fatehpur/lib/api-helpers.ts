import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";
import { getAuthPayload, JWTPayload, canAccessSchool, forbiddenResponse } from "@/lib/auth";

/**
 * Get schoolId for a request.
 * Priority:
 *  1. ?school=slug query param — allows admin panel to target a specific school
 *  2. Auth token schoolId — for authenticated admin requests to their own school
 *  3. x-school-slug header (set by middleware) — for public pages
 */
export async function getSchoolId(request: NextRequest): Promise<string | null> {
  const { searchParams } = new URL(request.url);
  const schoolParam = searchParams.get("school");

  // If explicit school slug is provided, resolve it
  if (schoolParam) {
    await connectDB();
    const school = await School.findOne({ slug: schoolParam, isActive: true }).select("_id");
    return school?._id?.toString() || null;
  }

  // For authenticated requests, use JWT schoolId
  const authPayload = getAuthPayload(request);
  if (authPayload?.schoolId) {
    return authPayload.schoolId;
  }

  // Public request fallback: resolve from middleware header
  const slug = request.headers.get("x-school-slug");
  if (!slug) return null;
  await connectDB();
  const school = await School.findOne({ slug, isActive: true }).select("_id");
  return school?._id?.toString() || null;
}

/**
 * Resolve school from ?school=slug only (not JWT). Used for admin list filtering.
 */
export async function resolveSchoolParamSchoolId(request: NextRequest): Promise<string | null> {
  const schoolParam = new URL(request.url).searchParams.get("school");
  if (!schoolParam) return null;
  await connectDB();
  const school = await School.findOne({ slug: schoolParam, isActive: true }).select("_id");
  return school?._id?.toString() || null;
}

/**
 * Build school filter for admin list endpoints.
 * Superadmin without ?school= sees all schools; with ?school= sees that school only.
 */
export async function buildAdminSchoolFilter(
  request: NextRequest,
  payload: JWTPayload
): Promise<{ filter: Record<string, unknown> } | { error: Response }> {
  const schoolParam = new URL(request.url).searchParams.get("school");
  let explicitSchoolId: string | null = null;

  if (schoolParam) {
    explicitSchoolId = await resolveSchoolParamSchoolId(request);
    if (!explicitSchoolId) {
      return { error: errorResponse("School not found", 404) };
    }
  }

  if (payload.role === "superadmin") {
    return { filter: explicitSchoolId ? { schoolId: explicitSchoolId } : {} };
  }

  const targetSchoolId = explicitSchoolId || payload.schoolId;
  if (!targetSchoolId || !canAccessSchool(payload, targetSchoolId)) {
    return { error: forbiddenResponse() };
  }
  return { filter: { schoolId: targetSchoolId } };
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
