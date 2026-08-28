import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Topper from "@/lib/models/Topper";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { topperCreateSchema, topperUpdateSchema } from "@/lib/validations";

// GET /api/toppers — public, paginated
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    const filter: Record<string, unknown> = { isPublished: true };

    // scope=all → fetch from all schools (for group landing)
    if (scope !== "all") {
      const schoolId = await getSchoolId(request);
      if (!schoolId) return errorResponse("School not found", 404);
      filter.schoolId = schoolId;
    }

    const [items, total] = await Promise.all([
      scope === "all"
        ? Topper.find(filter).populate("schoolId", "name slug").sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit)
        : Topper.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      Topper.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Toppers GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/toppers — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = topperCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid input: " + parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "));
    }

    const schoolId = await getSchoolId(request) || payload.schoolId;
    if (!canAccessSchool(payload, schoolId)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const topper = await Topper.create({ ...parsed.data, schoolId });
    return successResponse(topper, 201);
  } catch (error) {
    console.error("Toppers POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/toppers — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Topper id is required");

    const parsed = topperUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const topper = await Topper.findById(id);
    if (!topper) return errorResponse("Topper not found", 404);

    if (!canAccessSchool(payload, topper.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await Topper.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Toppers PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/toppers — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Topper id is required");

    await connectDB();
    const topper = await Topper.findById(id);
    if (!topper) return errorResponse("Topper not found", 404);

    if (!canAccessSchool(payload, topper.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    await Topper.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Toppers DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
