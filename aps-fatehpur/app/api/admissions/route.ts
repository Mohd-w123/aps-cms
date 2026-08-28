import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, buildAdminSchoolFilter, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Admission from "@/lib/models/Admission";
import "@/lib/models/School";
import { withSchoolName } from "@/lib/school-label";
import { admissionCreateSchema, admissionStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// POST /api/admissions — public
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = admissionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    await connectDB();
    const admission = await Admission.create({
      ...parsed.data,
      schoolId,
      status: "pending",
      appliedAt: new Date(),
    });

    return successResponse(admission, 201);
  } catch (error) {
    console.error("Admissions POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/admissions — admin protected, paginated
export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    let filter: Record<string, unknown>;

    if (payload.role === "sales") {
      filter = { salesPersonId: payload.userId, sentToSales: true };
    } else {
      const schoolFilter = await buildAdminSchoolFilter(request, payload);
      if ("error" in schoolFilter) return schoolFilter.error;
      filter = schoolFilter.filter;
    }

    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Admission.find(filter).populate("schoolId", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Admission.countDocuments(filter),
    ]);

    return successResponse(withSchoolName(items), 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Admissions GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/admissions — admin protected, update status
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...statusData } = body;
    if (!id) return errorResponse("Admission id is required");

    const parsed = admissionStatusSchema.safeParse(statusData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const admission = await Admission.findById(id);
    if (!admission) return errorResponse("Admission not found", 404);

    if (!canAccessSchool(payload, admission.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Admission.findByIdAndUpdate(
      id,
      { ...parsed.data, reviewedBy: payload.userId, reviewedAt: new Date() },
      { new: true }
    );

    return successResponse(updated);
  } catch (error) {
    console.error("Admissions PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}
