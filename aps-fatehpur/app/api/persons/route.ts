import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, unauthorizedResponse, forbiddenResponse, canAccessSchool } from "@/lib/auth";
import { successResponse, errorResponse, getSchoolId } from "@/lib/api-helpers";
import Person from "@/lib/models/Person";
import { personSchema, personUpdateSchema } from "@/lib/validations";

// GET /api/persons — public
export async function GET(request: NextRequest) {
  try {
    const schoolId = await getSchoolId(request);
    if (!schoolId) return errorResponse("School not found", 404);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    await connectDB();

    const filter: Record<string, unknown> = { schoolId, isActive: true };
    if (role) filter.role = role;

    const persons = await Person.find(filter).sort({ order: 1 });
    return successResponse(persons);
  } catch (error) {
    console.error("Persons GET error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/persons — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const parsed = personSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const person = await Person.create({ ...parsed.data, schoolId: payload.schoolId });
    return successResponse(person, 201);
  } catch (error) {
    console.error("Persons POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/persons — admin protected
export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Person id is required");

    const parsed = personUpdateSchema.safeParse(updateData);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
    }

    await connectDB();
    const person = await Person.findById(id);
    if (!person) return errorResponse("Person not found", 404);

    if (!canAccessSchool(payload, person.schoolId.toString())) {
      return forbiddenResponse();
    }

    const updated = await Person.findByIdAndUpdate(id, parsed.data, { new: true });
    return successResponse(updated);
  } catch (error) {
    console.error("Persons PUT error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/persons — admin protected
export async function DELETE(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Person id is required");

    await connectDB();
    const person = await Person.findById(id);
    if (!person) return errorResponse("Person not found", 404);

    if (!canAccessSchool(payload, person.schoolId.toString())) {
      return forbiddenResponse();
    }

    await Person.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Persons DELETE error:", error);
    return errorResponse("Internal server error", 500);
  }
}
