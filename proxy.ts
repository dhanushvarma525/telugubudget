
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Admin authentication is currently handled by
   * Supabase Auth on the client side.
   *
   * The previous admin_token / verifyToken system
   * has been removed because it belongs to the old
   * authentication system.
   */

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

