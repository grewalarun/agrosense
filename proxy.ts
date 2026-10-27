import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  NAME_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  isTokenFresh,
  refreshAccessToken,
} from "@/lib/session";

// Pages for signed-out visitors (the landing page and sign-in screens); signed-in users go to the dashboard
const AUTH_PAGES = ["/", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];
// Open to everyone, signed in or not
const PUBLIC_PAGES = ["/privacy"];

// Runs before every page and Server Function call. Access tokens live 15 minutes,
// so when one is about to expire it is refreshed here: Server Components can't set
// cookies, but the proxy can update both this request and the browser's cookies.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: string | null = null;
  let sessionEnded = false;

  if (!isTokenFresh(accessToken) && refreshToken) {
    try {
      refreshed = await refreshAccessToken(refreshToken);
      sessionEnded = refreshed === null;
      accessToken = refreshed ?? undefined;
    } catch {
      // Backend unreachable: keep the cookies so the user isn't logged out by an outage
      accessToken = undefined;
    }
  }

  const loggedIn = isTokenFresh(accessToken);

  let response: NextResponse;
  if (!loggedIn && !isAuthPage && !isPublicPage) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (loggedIn && isAuthPage) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    if (refreshed) {
      // Let this request's Server Components see the new token
      request.cookies.set(ACCESS_COOKIE, refreshed);
    }
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed, cookieOptions(refreshed));
  } else if (sessionEnded) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(NAME_COOKIE);
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
