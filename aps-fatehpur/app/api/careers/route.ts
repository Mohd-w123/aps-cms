import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Career from "@/lib/models/Career";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { careerCreateSchema, careerUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/careers — public, active only, paginated
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    const filter: Record<string, unknown> = { isActive: true };

    // scope=all → fetch from all schools (for group landing page)
    if (scope !== "all") {
      const schoolId = await getSchoolId(request);
      if (!schoolId) return errorResponse("School not found", 404);
      filter.schoolId = schoolId;
    }

    const [items, total] = await Promise.all([
      scope === "all"
        ? Career.find(filter).populate("schoolId", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit)
        : Career.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Career.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Careers GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/careers — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = careerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const career = await Career.create({ ...parsed.data, schoolId: payload.schoolId });
    return successResponse(career, 201);
  } catch (error) {
    console.error("Careers POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/careers — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Career id is required");

    const parsed = careerUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const career = await Career.findById(id);
    if (!career) return errorResponse("Career not found", 404);

    if (!canAccessSchool(payload, career.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Career.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Careers PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/careers — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Career id is required");

    await connectDB();
    const career = await Career.findById(id);
    if (!career) return errorResponse("Career not found", 404);

    if (!canAccessSchool(payload, career.schoolId.toString())) {
      return forbiddenResponse();
    }

    await Career.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Careers DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
