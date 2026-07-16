import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname, searchParams } = request.nextUrl;

  const isAuthRoute = pathname === "/login";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/campaigns");

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If landing on /login with ?expired=1, the server-side auth rejected
  // a stale token. Clear the bad cookie and let the user see the login page.
  if (isAuthRoute && searchParams.get("expired") === "1") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // If visiting /login while holding a valid-looking token, go to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/companies/:path*",
    "/contacts/:path*",
    "/campaigns/:path*",
    "/login",
  ],
};
