import { NextRequest } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/upload — admin protected
export async function POST(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    if (!payload) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("File is required");

    // Validate file size based on type
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_SIZE) return errorResponse("Video must be under 50MB");
    } else if (file.type === "application/pdf") {
      if (file.size > MAX_PDF_SIZE) return errorResponse("PDF must be under 10MB");
    } else {
      if (file.size > MAX_IMAGE_SIZE) return errorResponse("Image must be under 5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const schoolSlug = request.headers.get("x-school-slug") || "general";

    let resourceType: "image" | "video" | "raw" = "image";
    if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else if (file.type === "application/pdf") {
      resourceType = "raw";
    }

    const result = await uploadToCloudinary(buffer, schoolSlug, resourceType);

    return successResponse({
      url: result.url,
      publicId: result.publicId,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload POST error:", error);
    return errorResponse("Internal server error", 500);
  }
}
