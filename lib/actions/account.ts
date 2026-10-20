"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import { ACCESS_COOKIE, NAME_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/session";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { localeCookieOptions } from "@/lib/locale-cookie";
import type { User } from "@/lib/types";

export async function updateProfileAction(input: { name: string; phone: string }): Promise<Result<{ user: User }>> {
  const result = await run(() => apiFetch<{ user: User }>("/auth/me", { method: "PATCH", body: input }));
  if (result.error !== undefined) return result;

  // The sidebar shows the name from this cookie; keep it in step with the profile
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  cookieStore.set(NAME_COOKIE, result.data.user.name, cookieOptions(refreshToken ?? "", false));
  revalidatePath("/", "layout");
  return result;
}

// Sends this device's refresh token so the backend keeps this session and signs out the rest
export async function changePasswordAction(input: { currentPassword: string; newPassword: string }): Promise<Result<{ message: string }>> {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  return run(() =>
    apiFetch<{ message: string }>("/auth/change-password", { method: "POST", body: { ...input, refreshToken } })
  );
}

// Switches the UI language: remembered on this device (cookie) and, when logged in,
// on the account so other devices pick it up at their next login
export async function setLanguageAction(locale: string): Promise<Result<null>> {
  if (!isLocale(locale)) return { error: "Unsupported language" };
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, localeCookieOptions());

  if (cookieStore.get(ACCESS_COOKIE)?.value) {
    const saved = await run(() => apiFetch("/auth/me", { method: "PATCH", body: { language: locale } }));
    if (saved.error !== undefined) return saved;
  }
  revalidatePath("/", "layout");
  return { data: null };
}
