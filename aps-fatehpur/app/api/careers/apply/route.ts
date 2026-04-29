import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { successResponse, errorResponse, getSchoolId } from "@/lib/api-helpers";
import CareerApplication from "@/lib/models/CareerApplication";
import { careerApplySchema } from "@/lib/validations";

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
