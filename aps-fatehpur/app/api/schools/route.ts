import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import School from "@/lib/models/School";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { schoolUpdateSchema } from "@/lib/validations";

// GET /api/schools — list active schools (public)
export async function GET() {
  try {
    await connectDB();
    const schools = await School.find({ isActive: true }).sort({ name: 1 });
    return successResponse(schools);
  } catch (error) {
    console.error("Schools GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/schools — superadmin update a school
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("School id is required");

    const parsed = schoolUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const school = await School.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!school) return errorResponse("School not found", 404);

    return successResponse(school);
  } catch (error) {
    console.error("Schools PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}
