import { NextRequest, NextResponse } from "next/server";

const SCHOOL_SLUGS = new Set(["apsfatehpur", "apsgirls", "apsboys", "madrasa", "azadschool"]);

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const paramSchool = searchParams.get("school");

  // Check if URL is a branch path like /apsboys or /apsgirls
  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  const isBranchPath = Boolean(firstSegment && SCHOOL_SLUGS.has(firstSegment) && firstSegment !== "apsfatehpur");

  let slug = "apsfatehpur";

  if (paramSchool && SCHOOL_SLUGS.has(paramSchool)) {
    // 1. Explicit ?school= param always wins
    slug = paramSchool;
  } else if (isBranchPath) {
    // 2. Direct slug path /apsboys or /apsgirls
    slug = firstSegment;
  } else if (pathname === "/") {
    // 3. Root URL with no school param shows group landing
    slug = "apsfatehpur";
  } else {
    // 4. Inner pages (/about, /gallery, etc.) keep current school from cookie
    slug = request.cookies.get("school-slug")?.value || "apsfatehpur";
  }

  // If user visits /apsboys directly, rewrite to /?school=apsboys so the homepage renders that school
  if (isBranchPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/";
    rewriteUrl.searchParams.set("school", firstSegment);
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set("x-school-slug", slug);
    response.cookies.set("school-slug", slug, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-slug", slug);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.set("school-slug", slug, {
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
