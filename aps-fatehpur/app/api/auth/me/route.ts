import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const userObj = user.toJSON();
    // Add schoolSlug from populated schoolId
    const schoolDoc = user.schoolId as unknown as { slug?: string; _id?: unknown };
    if (schoolDoc && typeof schoolDoc === "object" && "slug" in schoolDoc) {
      userObj.schoolSlug = schoolDoc.slug;
      userObj.schoolId = (schoolDoc._id || userObj.schoolId)?.toString();
    }

    return Response.json({ success: true, data: { user: userObj } });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
