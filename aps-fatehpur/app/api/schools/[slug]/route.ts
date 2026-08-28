import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

// GET /api/schools/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const school = await School.findOne({ slug: params.slug, isActive: true });
    if (!school) return errorResponse("School not found", 404);
    return successResponse(school);
  } catch (error) {
    console.error("School slug GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}
