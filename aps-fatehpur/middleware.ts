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
  const forwardedHost = request.headers.get("x-forwarded-host") || "";
  const rawHost = forwardedHost || request.headers.get("host") || request.nextUrl.host || "";
  const host = rawHost.toLowerCase().split(":")[0];
  let slug = SCHOOL_MAP[host];

  // Always check ?school= param first — enables subdomain redirects in production
  // e.g. apsboys.apsfatehpur.com → apsfatehpur.com/?school=apsboys
  const paramSchool = request.nextUrl.searchParams.get("school");
  if (!slug && paramSchool) {
    slug = paramSchool;
  }

  // Localhost/Vercel fallback: use ?school= query param, then existing cookie for inner pages, then default
  if (!slug && (host.includes("localhost") || host.includes("vercel.app"))) {
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

  // Set the slug as a REQUEST header so API route handlers can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-slug", finalSlug);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set cookie so client components and subsequent requests can read it
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
