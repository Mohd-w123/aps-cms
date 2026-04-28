import { NextRequest, NextResponse } from "next/server";

const SCHOOL_MAP: Record<string, string> = {
  "apsfatehpur.com": "apsfatehpur",
  "www.apsfatehpur.com": "apsfatehpur",
  "apsgirls.apsfatehpur.com": "apsgirls",
  "apsboys.apsfatehpur.com": "apsboys",
  "madrasa.apsfatehpur.com": "madrasa",
  "azadschool.in": "azadschool",
  "www.azadschool.in": "azadschool",
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  let slug = SCHOOL_MAP[host];

  // Localhost fallback: use ?school= query param
  if (!slug && host.includes("localhost")) {
    slug = request.nextUrl.searchParams.get("school") || "apsfatehpur";
  }

  const response = NextResponse.next();
  response.headers.set("x-school-slug", slug || "apsfatehpur");

  // Set cookie so client components can read it
  response.cookies.set("school-slug", slug || "apsfatehpur", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|logos|favicons|images).*)",
  ],
};
