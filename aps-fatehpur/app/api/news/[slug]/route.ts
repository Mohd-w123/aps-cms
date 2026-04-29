import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { successResponse, errorResponse, getSchoolId } from "@/lib/api-helpers";
import News from "@/lib/models/News";

// GET /api/news/[slug] — public, single news by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    await connectDB();
    const news = await News.findOne({ schoolId, slug: params.slug, isPublished: true });
    if (!news) return errorResponse("News not found", 404);

    return successResponse(news);
  } catch (error) {
    console.error("News slug GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}
