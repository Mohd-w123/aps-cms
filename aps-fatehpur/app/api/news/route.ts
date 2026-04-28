import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, forbiddenResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import News from "@/lib/models/News";
import { newsCreateSchema, newsUpdateSchema } from "@/lib/validations";

// GET /api/news — public, paginated
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    const filter: Record<string, unknown> = { schoolId, isPublished: true };
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      News.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      News.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("News GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/news — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = newsCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const data: Record<string, unknown> = { ...parsed.data, schoolId: payload.schoolId };
    if (parsed.data.isPublished && !parsed.data.publishedAt) {
      data.publishedAt = new Date();
    }

    await connectDB();
    const news = await News.create(data);
    return successResponse(news, 201);
  } catch (error) {
    console.error("News POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/news — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("News id is required");

    const parsed = newsUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const news = await News.findById(id);
    if (!news) return errorResponse("News not found", 404);

    if (!canAccessSchool(payload, news.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await News.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("News PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/news — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("News id is required");

    await connectDB();
    const news = await News.findById(id);
    if (!news) return errorResponse("News not found", 404);

    if (!canAccessSchool(payload, news.schoolId.toString())) {
      return forbiddenResponse();
    }

    await News.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("News DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
