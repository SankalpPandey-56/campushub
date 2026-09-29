import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "campushub_session";

const COMMUNITY_PREFIXES = [
  "/feed",
  "/deals",
  "/events",
  "/resources",
  "/marketplace",
  "/lost-found",
  "/groups",
  "/messages",
  "/notifications",
  "/saved",
  "/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  // Signed-in users skip the auth screens; deep-link targets still work.
  if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Community areas require at least a session (fine-grained status checks
  // happen in the pages themselves via requireMember()).
  if (!hasSession && COMMUNITY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/feed/:path*",
    "/deals/:path*",
    "/events/:path*",
    "/resources/:path*",
    "/marketplace/:path*",
    "/lost-found/:path*",
    "/groups/:path*",
    "/messages/:path*",
    "/notifications",
    "/saved",
    "/profile/:path*",
  ],
};
