"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";

// Enables or disables a user; disabling also ends their sessions
export async function setUserStatusAction(userId: string, status: "enabled" | "disabled"): Promise<Result<{ status: string }>> {
  const result = await run(() => apiFetch<{ status: string }>(`/admin/users/${userId}/status`, { method: "PATCH", body: { status } }));
  if (!result.error) revalidatePath("/admin/users");
  return result;
}
