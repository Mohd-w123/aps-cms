import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Slider from "@/lib/models/Slider";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { sliderCreateSchema, sliderUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/sliders — public, filtered by scope
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    // scope=all → fetch all published sliders across all schools
    if (scope === "all") {
      const filter: Record<string, unknown> = { isPublished: true };
      const [items, total] = await Promise.all([
        Slider.find(filter).populate("schoolId", "name slug").sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
        Slider.countDocuments(filter),
      ]);
      return successResponse(items, 200, paginationMeta(page, limit, total));
    }

    if (scope === "group") {
      // First check if any group-specific sliders exist
      let filter: Record<string, unknown> = { scope: "group", isPublished: true };
      let items = await Slider.find(filter).sort({ order: 1 }).skip(skip).limit(limit);
      let total = await Slider.countDocuments(filter);

      // If no group sliders, combine sliders from all schools!
      if (items.length === 0) {
        filter = { isPublished: true };
        [items, total] = await Promise.all([
          Slider.find(filter).populate("schoolId", "name slug").sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
          Slider.countDocuments(filter),
        ]);
      }
      return successResponse(items, 200, paginationMeta(page, limit, total));
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    const filter: Record<string, unknown> = { schoolId, isPublished: true };
    if (scope) filter.scope = scope;

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
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Slider id is required");

    const parsed = sliderUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const slider = await Slider.findById(id);
    if (!slider) return errorResponse("Slider not found", 404);

    if (!canAccessSchool(payload, slider.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await Slider.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
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
    if (!id) return errorResponse("Slider id is required");

    await connectDB();
    const slider = await Slider.findById(id);
    if (!slider) return errorResponse("Slider not found", 404);

    if (!canAccessSchool(payload, slider.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    await Slider.findByIdAndDelete(id);
    return successResponse({ message: "Slider deleted successfully" });
  } catch (error) {
    console.error("Sliders DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
