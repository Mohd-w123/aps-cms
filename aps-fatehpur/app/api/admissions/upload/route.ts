import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB max
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// POST /api/admissions/upload — public (for admission form document attachments)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("File is required");

    if (file.size > MAX_SIZE) {
      return errorResponse("Document must be under 10MB");
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i)) {
      return errorResponse("Allowed files: PDF, JPG, PNG, WebP, DOC, DOCX");
    }

    let resourceType: "image" | "raw" = "image";
    if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.match(/\.(doc|docx)$/i)) {
      resourceType = "raw";
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const schoolSlug = request.headers.get("x-school-slug") || "admissions";
    const result = await uploadToCloudinary(buffer, `admissions/${schoolSlug}`, resourceType);

    return successResponse({
      name: file.name,
      url: result.url,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Admission document upload error:", error);
    return errorResponse("Document upload failed", 500);
  }
}
