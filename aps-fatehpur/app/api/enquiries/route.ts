import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, canAccessSchool, forbiddenResponse } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId, parsePagination, paginationMeta } from "@/lib/api-helpers";
import Enquiry from "@/lib/models/Enquiry";
import { enquiryCreateSchema, enquiryStatusSchema } from "@/lib/validations";

// POST /api/enquiries — public
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enquiryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    await connectDB();
    const enquiry = await Enquiry.create({
      ...parsed.data,
      schoolId,
      status: "new",
    });

    return successResponse(enquiry, 201);
  } catch (error) {
    console.error("Enquiries POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/enquiries — admin protected, paginated
export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const { page, limit, skip } = parsePagination(searchParams);

    await connectDB();

    // Use ?school= param if provided (for superadmin viewing other schools)
    const explicitSchoolId = await getSchoolId(request);
    const targetSchoolId = explicitSchoolId || payload.schoolId;
    if (!canAccessSchool(payload, targetSchoolId)) return forbiddenResponse();

    const filter: Record<string, unknown> = { schoolId: targetSchoolId };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    return successResponse(items, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Enquiries GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/enquiries — admin protected, update status
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...statusData } = body;
    if (!id) return errorResponse("Enquiry id is required");

    const parsed = enquiryStatusSchema.safeParse(statusData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return errorResponse("Enquiry not found", 404);

    if (!canAccessSchool(payload, enquiry.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Enquiry.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Enquiries PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}
