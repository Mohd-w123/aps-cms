import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB for alumni photos
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/alumni/upload — public (for alumni registration photo)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("File is required");

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse("Only JPEG, PNG, and WebP images are allowed");
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("Photo must be under 2MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "alumni", "image");

    return successResponse({ url: result.url });
  } catch (error) {
    console.error("Alumni upload error:", error);
    return errorResponse("Upload failed", 500);
  }
}
