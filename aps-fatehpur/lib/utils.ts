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
