import { type NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("token")?.value;
  const session = token ? await verifyToken(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
