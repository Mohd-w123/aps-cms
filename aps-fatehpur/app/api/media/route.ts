import { NextRequest } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import cloudinary from "@/lib/cloudinary";

// GET /api/media — list uploaded images from Cloudinary
export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const schoolSlug = request.headers.get("x-school-slug") || "general";
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `aps-fatehpur/${schoolSlug}`,
      resource_type: "image",
      max_results: 30,
      next_cursor: cursor,
    });

    // Also fetch from "general" folder for shared assets
    const generalResult = await cloudinary.api.resources({
      type: "upload",
      prefix: "aps-fatehpur/general",
      resource_type: "image",
      max_results: 10,
    });

    const images = [
      ...result.resources.map((r: { secure_url: string; public_id: string; created_at: string; bytes: number }) => ({
        url: r.secure_url,
        publicId: r.public_id,
        createdAt: r.created_at,
        size: r.bytes,
      })),
      ...generalResult.resources.map((r: { secure_url: string; public_id: string; created_at: string; bytes: number }) => ({
        url: r.secure_url,
        publicId: r.public_id,
        createdAt: r.created_at,
        size: r.bytes,
      })),
    ];

    // Deduplicate by publicId
    const unique = Array.from(new Map(images.map((img: { publicId: string }) => [img.publicId, img])).values());

    return successResponse({
      images: unique,
      nextCursor: result.next_cursor || null,
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return errorResponse("Failed to fetch media library", 500);
  }
}
