import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/dal";
import type { User } from "@/lib/types";

// cache(): the layout, sidebar and page of one render share a single request
export const getMe = cache(async function getMe() {
  const { user } = await apiFetch<{ user: User }>("/auth/me");
  return user;
});
