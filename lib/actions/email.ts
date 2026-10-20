"use server";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";

export type TestEmailInput = { to: string; subject?: string; message?: string };

// Sends a test email through the backend (Resend). The backend validates the
// address and allows one test email per minute per user.
export async function sendTestEmailAction(input: TestEmailInput): Promise<Result<{ id: string; to: string }>> {
  return run(() => apiFetch<{ id: string; to: string }>("/email/test", { method: "POST", body: input }));
}
