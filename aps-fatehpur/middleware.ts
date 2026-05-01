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

  // Localhost fallback: use ?school= query param, then existing cookie for inner pages, then default
  if (!slug && host.includes("localhost")) {
    const paramSchool = request.nextUrl.searchParams.get("school");
    const isRootPath = request.nextUrl.pathname === "/";

    if (paramSchool) {
      // Explicit ?school= param always wins
      slug = paramSchool;
    } else if (isRootPath) {
      // Root path without ?school= → always show group landing
      slug = "apsfatehpur";
    } else {
      // Inner pages → preserve school from cookie
      slug = request.cookies.get("school-slug")?.value || "apsfatehpur";
    }
  }

  const finalSlug = slug || "apsfatehpur";
  const response = NextResponse.next();
  response.headers.set("x-school-slug", finalSlug);

  // Set cookie so client components can read it
  response.cookies.set("school-slug", finalSlug, {
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
