"use server";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { ACCESS_COOKIE, NAME_COOKIE, REFRESH_COOKIE, Tokens, apiBaseUrl, cookieOptions } from "@/lib/session";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { localeCookieOptions } from "@/lib/locale-cookie";

type AuthResponse = Tokens & {
  user?: { name?: string; language?: string };
  message?: string;
  // backend error code, e.g. WRONG_CODE, so the form can show a translated message
  code?: string;
  attemptsLeft?: number;
  // set when the email must be verified with the emailed code first
  verificationRequired?: boolean;
  verificationId?: string;
  email?: string;
  retryAfter?: number;
  isNew?: boolean;
};

// The verify-email page needs these to finish a signup
export type Verification = { id: string; email: string; wait: number };

export type AuthResult =
  | { success: true; isNew?: boolean; error?: undefined; verify?: undefined }
  | { error: string; code?: string; attemptsLeft?: number; retryAfter?: number; verify?: undefined }
  | { verify: Verification; error?: undefined; success?: undefined; isNew?: undefined };

async function startSession(data: AuthResponse, fallbackName: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, data.accessToken, cookieOptions(data.accessToken));
  cookieStore.set(REFRESH_COOKIE, data.refreshToken, cookieOptions(data.refreshToken));
  cookieStore.set(NAME_COOKIE, data.user?.name || fallbackName, cookieOptions(data.refreshToken, false));
  // The account's saved language wins, so it follows the user to every device
  if (isLocale(data.user?.language)) {
    cookieStore.set(LOCALE_COOKIE, data.user.language, localeCookieOptions());
  }
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
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: "Could not reach the server, please try again" } as AuthResponse };
  }
}

function toVerification(data: AuthResponse): Verification | null {
  if (!data.verificationRequired || !data.verificationId || !data.email) return null;
  return { id: data.verificationId, email: data.email, wait: data.retryAfter ?? 0 };
}

function toError(data: AuthResponse, fallback: string): AuthResult {
  return { error: data.message || fallback, code: data.code, attemptsLeft: data.attemptsLeft, retryAfter: data.retryAfter };
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  const { ok, data } = await postAuth("login", { email, password });
  // Signed up but never entered the code: a new code was sent
  const verify = toVerification(data);
  if (verify) return { verify };
  if (!ok) return toError(data, "Login failed");
  await startSession(data, email.split("@")[0]);
  return { success: true };
}

// Signup emails a code; the account is created by verifyEmailAction
export async function signupAction(name: string, email: string, password: string): Promise<AuthResult> {
  // Start the account in the language picked on the signup screen
  const { ok, data } = await postAuth("signup", { name, email, password, language: await getLocale() });
  if (!ok) return toError(data, "Signup failed");
  const verify = toVerification(data);
  if (!verify) return { error: "Signup failed" };
  return { verify };
}

export async function verifyEmailAction(verificationId: string, code: string): Promise<AuthResult> {
  const { ok, data } = await postAuth("verify-email", { verificationId, code });
  if (!ok) return toError(data, "Verification failed");
  await startSession(data, data.user?.name ?? "");
  return { success: true, isNew: true };
}

export async function resendCodeAction(verificationId: string): Promise<AuthResult> {
  const { ok, data } = await postAuth("resend-code", { verificationId });
  if (!ok) return toError(data, "Could not send a new code");
  return { success: true };
}

// `credential` is the ID token from the Google sign-in button
export async function googleSignInAction(credential: string): Promise<AuthResult> {
  const { ok, data } = await postAuth("google", { credential, language: await getLocale() });
  if (!ok) return toError(data, "Google sign-in failed");
  await startSession(data, data.user?.name ?? "");
  return { success: true, isNew: Boolean(data.isNew) };
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
