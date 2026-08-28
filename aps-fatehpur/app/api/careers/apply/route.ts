import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import CareerApplication from "@/lib/models/CareerApplication";
import { careerApplySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/careers/apply — admin, list applications
export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    const filter: Record<string, unknown> = { schoolId: payload.schoolId };
    const status = searchParams.get("status");
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      CareerApplication.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
      CareerApplication.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("CareerApply GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/careers/apply — admin, update status
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) return errorResponse("ID and status required");

    await connectDB();
    const app = await CareerApplication.findByIdAndUpdate(id, { status }, { new: true });
    if (!app) return errorResponse("Application not found", 404);
    return successResponse(app);
  } catch (error) {
    console.error("CareerApply PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/careers/apply — public
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = careerApplySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    await connectDB();
    const application = await CareerApplication.create({
      ...parsed.data,
      schoolId,
      status: "pending",
      appliedAt: new Date(),
    });

    return successResponse(application, 201);
  } catch (error) {
    console.error("Career Apply POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}
