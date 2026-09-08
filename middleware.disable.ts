import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  const token = request.cookies.get("admin_token")?.value;


  // If user is already logged in and opens login page
  if (pathname === "/admin/login") {

    if (token) {

      try {

        jwt.verify(
          token,
          "telugubudget_secret"
        );

        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );


      } catch {

        return NextResponse.next();

      }

    }

    return NextResponse.next();

  }



  // Protect admin pages
  if (pathname.startsWith("/admin")) {


    if (!token) {

      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );

    }


    try {

      jwt.verify(
        token,
        "telugubudget_secret"
      );


      return NextResponse.next();


    } catch {


      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );


      response.cookies.delete(
        "admin_token"
      );


      return response;

    }

  }


  return NextResponse.next();

}



export const config = {

  matcher: [
    "/admin/:path*"
  ]

};