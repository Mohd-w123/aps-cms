import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Alumni from "@/lib/models/Alumni";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { alumniCreateSchema, alumniUpdateSchema } from "@/lib/validations";

// POST /api/alumni — public (submit for approval)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = alumniCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    await connectDB();
    const alumni = await Alumni.create({
      ...parsed.data,
      schoolId,
      isApproved: false,
    });

    return successResponse(alumni, 201);
  } catch (error) {
    console.error("Alumni POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/alumni — dual mode: admin sees all, public sees approved only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const { page, limit, skip } = parsePagination(searchParams);

    const payload = requireAuth(request);

    await connectDB();

    let filter: Record<string, unknown>;

    // scope=all → fetch approved alumni across all schools (for group landing & alumni page)
    if (scope === "all" && !payload) {
      filter = { isApproved: true };
      const [items, total] = await Promise.all([
        Alumni.find(filter).populate("schoolId", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Alumni.countDocuments(filter),
      ]);
      return successResponse(items, 200, paginationMeta(page, limit, total));
    }

    if (payload) {
      // Admin mode: use ?school= param if provided (for superadmin viewing other schools)
      const explicitSchoolId = await getSchoolId(request);
      const targetSchoolId = explicitSchoolId || payload.schoolId;

      // Permission check: non-superadmin can only view their own school
      if (!canAccessSchool(payload, targetSchoolId)) return forbiddenResponse();

      filter = { schoolId: targetSchoolId };
    } else {
      // Public mode: approved alumni only
      const schoolId = await getSchoolId(request);
      if (!schoolId) return errorResponse("School not found", 404);
      filter = { schoolId, isApproved: true };
    }

    const [items, total] = await Promise.all([
      Alumni.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Alumni.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Alumni GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/alumni — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Alumni id is required");

    const parsed = alumniUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const alumni = await Alumni.findById(id);
    if (!alumni) return errorResponse("Alumni not found", 404);

    if (!canAccessSchool(payload, alumni.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Alumni.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Alumni PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/alumni?id=xxx — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Alumni id is required");

    await connectDB();
    const alumni = await Alumni.findById(id);
    if (!alumni) return errorResponse("Alumni not found", 404);

    if (!canAccessSchool(payload, alumni.schoolId.toString())) {
      return forbiddenResponse();
    }

    await Alumni.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Alumni DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
