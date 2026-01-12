import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// Adjust these paths according to what should be public
const publicPaths = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const token =
    cookies.get("next-auth.session-token") ||
    cookies.get("__Secure-next-auth.session-token");

  // Allow public files, or explicitly public paths
  if (
    PUBLIC_FILE.test(nextUrl.pathname) ||
    publicPaths.some((path) => nextUrl.pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access
  return NextResponse.next();
}

// Specify paths for middleware
export const config = {
  matcher: [
    /*
      Match all paths except for:
        - the login page
        - API auth endpoints
        - static files
    */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
