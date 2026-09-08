import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip HTML tags to plain text (for length checks / previews). */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ~5 lines of body text — used to decide if "Read full message" is shown. */
export function isPrincipalPreviewTruncated(html: string, maxChars = 300): boolean {
  return stripHtml(html).length > maxChars;
}

/**
 * Convert any YouTube URL (watch, share, shorts, embed) to an embed URL.
 */
export function toEmbedUrl(url: string): string {
  if (!url) return "";
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
  return url;
}

/**
 * Check if URL points directly to a video file (Cloudinary video or .mp4/.webm/.mov).
 */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("/video/upload/") ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)
  );
}

/**
 * Extract YouTube thumbnail or Cloudinary video thumbnail if available.
 */
export function getVideoThumbnail(videoUrl: string): string {
  if (!videoUrl) return "";
  const ytMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  if (videoUrl.includes("/video/upload/")) {
    return videoUrl.replace(/\.[a-zA-Z0-9]+(?:\?.*)?$/, ".jpg");
  }
  return "";
}
