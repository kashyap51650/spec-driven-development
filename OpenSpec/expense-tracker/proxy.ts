import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    const token = req.cookies.get("token")?.value;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || "");
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      } catch {
        // invalid token — allow to continue to login/register
      }
    }
  }

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect dashboard and api routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET || "");
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/login", "/register"],
};
