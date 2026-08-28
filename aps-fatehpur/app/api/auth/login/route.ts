import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import "@/lib/models/School"; // ensure School model is registered for populate
import { comparePassword, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email, isActive: true }).select(
      "+passwordHash"
    );
    if (!user) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      schoolId: user.schoolId?.toString() || "",
      role: user.role,
    });

    // Populate school to get slug
    await user.populate("schoolId", "slug name");

    // Return user without passwordHash, add schoolSlug
    const userObj = user.toJSON();
    const schoolDoc = user.schoolId as unknown as { slug?: string; _id?: unknown };
    if (schoolDoc && typeof schoolDoc === "object" && "slug" in schoolDoc) {
      userObj.schoolSlug = schoolDoc.slug;
      userObj.schoolId = (schoolDoc._id || userObj.schoolId)?.toString();
    }

    const response = Response.json(
      { success: true, data: { token, user: userObj } },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
