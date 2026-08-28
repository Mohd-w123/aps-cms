import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId } from "@/lib/api-helpers";
import AICU from "@/lib/models/AICU";
import "@/lib/models/School"; // Ensure School model is registered for populate
import { aicuSchema, aicuUpdateSchema } from "@/lib/validations";

// GET /api/aicu — public, returns single active AICU doc (or all if scope=all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    await connectDB();

    // scope=all → fetch from all schools (for group landing page)
    if (scope === "all") {
      const items = await AICU.find({ isActive: true }).populate("schoolId", "name slug");
      return successResponse(items);
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    const aicu = await AICU.findOne({ schoolId, isActive: true });
    return successResponse(aicu);
  } catch (error) {
    console.error("AICU GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/aicu — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = aicuSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request) || payload.schoolId;
    if (!canAccessSchool(payload, schoolId)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const aicu = await AICU.create({ ...parsed.data, schoolId });
    return successResponse(aicu, 201);
  } catch (error) {
    console.error("AICU POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/aicu — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("AICU id is required");

    const parsed = aicuUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const aicu = await AICU.findById(id);
    if (!aicu) return errorResponse("AICU not found", 404);

    if (!canAccessSchool(payload, aicu.schoolId.toString())) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await AICU.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("AICU PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}
