// Session cookie helpers shared by proxy.ts and server code. No Next request APIs here,
// so it can run in the proxy as well as in Server Functions and Route Handlers.

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const NAME_COOKIE = "userName";

export type Tokens = { accessToken: string; refreshToken: string };

// Reads the `exp` claim without verifying the signature; the backend verifies on every call.
export function tokenExpiry(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// True if the token is still valid for at least `skewMs` (default 30s).
export function isTokenFresh(token: string | undefined, skewMs = 30_000): boolean {
  const expiry = tokenExpiry(token);
  return expiry !== null && expiry - skewMs > Date.now();
}

export function cookieOptions(token: string, httpOnly = true) {
  const expiry = tokenExpiry(token);
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(expiry && { expires: new Date(expiry) }),
  };
}

export function apiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) throw new Error("API_BASE_URL is not set");
  return url.replace(/\/$/, "");
}

// Exchanges a refresh token for a new access token. Returns null if the session is
// no longer valid, and throws on network errors so callers don't log users out
// just because the backend is unreachable.
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${apiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Token refresh failed with ${res.status}`);
  const data = await res.json();
  return data.accessToken ?? null;
}
