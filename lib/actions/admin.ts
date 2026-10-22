"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import type { AdminMessage, AdminUser, AudiencePreview, MessageAudience } from "@/lib/types";

// Enables or disables a user; disabling also ends their sessions
export async function setUserStatusAction(userId: string, status: "enabled" | "disabled"): Promise<Result<{ status: string }>> {
  const result = await run(() => apiFetch<{ status: string }>(`/admin/users/${userId}/status`, { method: "PATCH", body: { status } }));
  if (!result.error) revalidatePath("/admin/users");
  return result;
}

export type MessageInput = { subject: string; body: string; audience: MessageAudience };

export async function previewAudienceAction(audience: MessageAudience): Promise<Result<AudiencePreview>> {
  return run(() => apiFetch<AudiencePreview>("/admin/messages/audience", { method: "POST", body: { audience } }));
}

// Finds users to pick as recipients
export async function searchUsersAction(search: string): Promise<Result<Pick<AdminUser, "id" | "name" | "email">[]>> {
  return run(async () => {
    const { users } = await apiFetch<{ users: AdminUser[] }>("/admin/users", { query: { search, status: "enabled", limit: 8 } });
    return users.map(({ id, name, email }) => ({ id, name, email }));
  });
}

// Creates the draft, or updates it when it already exists
export async function saveMessageAction(id: string | null, input: MessageInput): Promise<Result<AdminMessage>> {
  return run(async () => {
    const { message } = await apiFetch<{ message: AdminMessage }>(id ? `/admin/messages/${id}` : "/admin/messages", {
      method: id ? "PATCH" : "POST",
      body: input,
    });
    return message;
  });
}

export async function sendTestMessageAction(id: string): Promise<Result<{ to: string }>> {
  return run(() => apiFetch<{ to: string }>(`/admin/messages/${id}/test`, { method: "POST" }));
}

// Sends the next chunk; callers repeat it until `pending` is 0
export async function sendMessageChunkAction(id: string, retryFailed = false): Promise<Result<AdminMessage>> {
  const result = await run(async () => {
    const { message } = await apiFetch<{ message: AdminMessage }>(`/admin/messages/${id}/send`, { method: "POST", body: { retryFailed } });
    return message;
  });
  revalidatePath("/admin/messages");
  return result;
}

export async function deleteMessageAction(id: string): Promise<Result<{ id: string }>> {
  const result = await run(() => apiFetch<{ id: string }>(`/admin/messages/${id}`, { method: "DELETE" }));
  revalidatePath("/admin/messages");
  return result;
}
