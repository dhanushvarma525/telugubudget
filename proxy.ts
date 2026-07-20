import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // Allow login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all admin pages
  if (pathname.startsWith("/admin")) {

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    const user = verifyToken(token);

    if (!user) {

      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );

      response.cookies.delete("admin_token");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};