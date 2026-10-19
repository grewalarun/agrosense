import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, NAME_COOKIE, REFRESH_COOKIE } from "@/lib/session";

// apiFetch redirects here when the backend rejects the token. Cookies can't be
// cleared while a page is rendering, so this route does it before going to /login.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?expired=1", request.url));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(NAME_COOKIE);
  return response;
}
