import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Slider from "@/lib/models/Slider";
import { sliderCreateSchema, sliderUpdateSchema } from "@/lib/validations";

// GET /api/sliders — public, filtered by scope
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "school";
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    const filter: Record<string, unknown> = { schoolId, isPublished: true, scope };
    const [items, total] = await Promise.all([
      Slider.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      Slider.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Sliders GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/sliders — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = sliderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request) || payload.schoolId;
    if (!canAccessSchool(payload, schoolId)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const slider = await Slider.create({ ...parsed.data, schoolId });
    return successResponse(slider, 201);
  } catch (error) {
    console.error("Sliders POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/sliders — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return errorResponse("ID required");

    const parsed = sliderUpdateSchema.safeParse(rest);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const slider = await Slider.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!slider) return errorResponse("Slider not found", 404);
    return successResponse(slider);
  } catch (error) {
    console.error("Sliders PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/sliders — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("ID required");

    await connectDB();
    await Slider.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Sliders DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
