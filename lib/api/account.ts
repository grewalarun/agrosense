import "server-only";
import { apiFetch } from "@/lib/dal";
import type { User } from "@/lib/types";

export async function getMe() {
  const { user } = await apiFetch<{ user: User }>("/auth/me");
  return user;
}
