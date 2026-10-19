import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, NAME_COOKIE, apiBaseUrl } from "@/lib/session";

// Clears the session cookies and sends the user to /login
const SESSION_EXPIRED_URL = "/api/auth/session-expired";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getUser() {
  const cookieStore = await cookies();
  if (!cookieStore.get(ACCESS_COOKIE)?.value) return null;
  return { name: cookieStore.get(NAME_COOKIE)?.value || "User" };
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildQuery(query?: Query) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Calls the AgriBiz backend as the logged-in user. proxy.ts keeps the access token
// fresh, so a 401 here means the session is gone and the user is sent to /login.
// Note: redirect() works by throwing, so don't swallow errors from this in a catch-all.
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, query }: { method?: string; body?: unknown; query?: Query } = {}
): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect(SESSION_EXPIRED_URL);

  const res = await fetch(`${apiBaseUrl()}${path}${buildQuery(query)}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401) redirect(SESSION_EXPIRED_URL);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message || "Something went wrong");
  return data as T;
}
