import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const isAuth = pathname === "/login" || pathname === "/signup";
  const isApp = pathname.startsWith("/dashboard") || pathname.startsWith("/farms") || pathname.startsWith("/settings");

  if (isApp && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuth && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/farms/:path*", "/settings/:path*", "/login", "/signup"],
};
