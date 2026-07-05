import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Gallery from "@/lib/models/Gallery";
import { galleryCreateSchema, galleryUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/gallery — public, paginated
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

    const type = searchParams.get("type");
    if (type === "image" || type === "video") filter.type = type;

    const [items, total] = await Promise.all([
      Gallery.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      Gallery.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Gallery GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/gallery — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = galleryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request) || payload.schoolId;
    if (!canAccessSchool(payload, schoolId)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const gallery = await Gallery.create({ ...parsed.data, schoolId });
    return successResponse(gallery, 201);
  } catch (error) {
    console.error("Gallery POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/gallery — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Gallery id is required");

    const parsed = galleryUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const gallery = await Gallery.findById(id);
    if (!gallery) return errorResponse("Gallery not found", 404);

    if (!canAccessSchool(payload, gallery.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await Gallery.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Gallery PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/gallery — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Gallery id is required");

    await connectDB();
    const gallery = await Gallery.findById(id);
    if (!gallery) return errorResponse("Gallery not found", 404);

    if (!canAccessSchool(payload, gallery.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    await Gallery.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
