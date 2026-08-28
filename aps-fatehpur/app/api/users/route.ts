import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { requireAuth, unauthorizedResponse, forbiddenResponse, canAccessSchool, hashPassword } from "@/lib/auth";
import { successResponse, errorResponse, parsePagination, paginationMeta } from "@/lib/api-helpers";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/users — admin: list users by school
export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = {};
    if (payload.role !== "superadmin") {
      filter.schoolId = payload.schoolId;
    } else if (searchParams.get("schoolId")) {
      filter.schoolId = searchParams.get("schoolId");
    }
    if (searchParams.get("role")) {
      filter.role = searchParams.get("role");
    }

    const [data, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return successResponse(data, 200, paginationMeta(page, limit, total));
  } catch (error) {
    console.error("Users GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/users — admin: create user
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    // school_admin can only create editors/sales for their school
    const { password, schoolId: parsedSchoolId, ...rest } = parsed.data;
    let schoolId = parsedSchoolId;
    if (payload.role === "school_admin") {
      if (!schoolId) schoolId = payload.schoolId;
      if (schoolId !== payload.schoolId) return forbiddenResponse();
      if (rest.role !== "editor" && rest.role !== "sales") return forbiddenResponse("School admins can only create editors and sales users");
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return errorResponse("Email already in use");

    const passwordHash = await hashPassword(password);
    const userData: Record<string, unknown> = { ...rest, passwordHash };
    if (schoolId) userData.schoolId = schoolId;
    const user = await User.create(userData);

    return successResponse(user, 201);
  } catch (error) {
    console.error("Users POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/users — admin: update user
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("User id is required");

    const parsed = userUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const user = await User.findById(id);
    if (!user) return errorResponse("User not found", 404);

    if (payload.role !== "superadmin" && !canAccessSchool(payload, user.schoolId.toString())) {
      return forbiddenResponse();
    }

    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.password) {
      update.passwordHash = await hashPassword(parsed.data.password);
      delete update.password;
    }

    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Users PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/users — admin: delete user
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request, ["superadmin", "school_admin"]);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("User id is required");

    await connectDB();
    const user = await User.findById(id);
    if (!user) return errorResponse("User not found", 404);

    if (payload.role !== "superadmin" && user.schoolId && !canAccessSchool(payload, user.schoolId.toString())) {
      return forbiddenResponse();
    }

    await User.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
