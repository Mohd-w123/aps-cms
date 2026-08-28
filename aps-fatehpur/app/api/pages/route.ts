import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, forbiddenResponse, canAccessSchool, getAuthPayload } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId } from "@/lib/api-helpers";
import Page from "@/lib/models/Page";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { pageCreateSchema, pageUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/pages — public (isPublished filter) or admin (all pages)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const scope = searchParams.get("scope");
    const isAdmin = !!getAuthPayload(request);

    await connectDB();

    // scope=all → fetch across all schools (for group landing inner pages)
    if (scope === "all") {
      if (slug) {
        const pages = await Page.find({ slug, isPublished: true }).populate("schoolId", "name slug");
        return successResponse(pages);
      }
      const pages = await Page.find({ isPublished: true }).populate("schoolId", "name slug").sort({ createdAt: -1 });
      return successResponse(pages);
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    if (slug) {
      const filter: Record<string, unknown> = { schoolId, slug };
      if (!isAdmin) filter.isPublished = true;
      const page = await Page.findOne(filter);
      if (!page) return errorResponse("Page not found", 404);
      return successResponse(page);
    }

    const filter: Record<string, unknown> = { schoolId };
    if (!isAdmin) filter.isPublished = true;
    const pages = await Page.find(filter).sort({ createdAt: -1 });
    return successResponse(pages);
  } catch (error) {
    console.error("Pages GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/pages — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = pageCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request) || payload.schoolId;
    if (!canAccessSchool(payload, schoolId)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const page = await Page.create({ ...parsed.data, schoolId });
    return successResponse(page, 201);
  } catch (error) {
    console.error("Pages POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/pages — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Page id is required");

    const parsed = pageUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const page = await Page.findById(id);
    if (!page) return errorResponse("Page not found", 404);

    if (!canAccessSchool(payload, page.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Page.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Pages PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/pages — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Page id is required");

    await connectDB();
    const page = await Page.findById(id);
    if (!page) return errorResponse("Page not found", 404);

    if (!canAccessSchool(payload, page.schoolId.toString())) {
      return forbiddenResponse();
    }

    await Page.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Pages DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
