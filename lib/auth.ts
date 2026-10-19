"use server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, NAME_COOKIE, REFRESH_COOKIE, Tokens, apiBaseUrl, cookieOptions } from "@/lib/session";

type AuthResponse = Tokens & { user?: { name?: string }; message?: string };

async function startSession(data: AuthResponse, fallbackName: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, data.accessToken, cookieOptions(data.accessToken));
  cookieStore.set(REFRESH_COOKIE, data.refreshToken, cookieOptions(data.refreshToken));
  cookieStore.set(NAME_COOKIE, data.user?.name || fallbackName, cookieOptions(data.refreshToken, false));
}

async function postAuth(path: string, body: Record<string, string>) {
  try {
    const res = await fetch(`${apiBaseUrl()}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data: AuthResponse = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { message: "Could not reach the server, please try again" } as AuthResponse };
  }
}

export async function loginAction(email: string, password: string) {
  const { ok, data } = await postAuth("login", { email, password });
  if (!ok) return { error: data.message || "Login failed" };
  await startSession(data, email.split("@")[0]);
  return { success: true };
}

export async function signupAction(name: string, email: string, password: string) {
  const { ok, data } = await postAuth("signup", { name, email, password });
  if (!ok) return { error: data.message || "Signup failed" };
  await startSession(data, name);
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await postAuth("logout", { refreshToken });
  }
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  cookieStore.delete(NAME_COOKIE);
}
