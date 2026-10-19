"use server";
import { cookies } from "next/headers";

const BASE_URL = "https://agribiz-nine.vercel.app/api/auth";

export async function loginAction(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.message || "Login failed" };

  const cookieStore = await cookies();
  cookieStore.set("accessToken", data.accessToken || data.token || "", {
    httpOnly: true, secure: true, path: "/", maxAge: 60 * 60 * 24,
  });
  if (data.refreshToken) {
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true, secure: true, path: "/", maxAge: 60 * 60 * 24 * 7,
    });
  }
  cookieStore.set("userName", data.user?.name || email.split("@")[0], { path: "/" });
  return { success: true };
}

export async function signupAction(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.message || "Signup failed" };
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (refreshToken) {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userName");
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const name = cookieStore.get("userName")?.value;
  return token ? { name: name || "User", token } : null;
}
