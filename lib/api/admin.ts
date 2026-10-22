import "server-only";
import { apiFetch as rawFetch, orNotFound } from "@/lib/dal";
import type {
  AdminActivity, AdminBreakdowns, AdminOverview, AdminPlatform, AdminPlatforms, AdminSignups, AdminUserList, AdminMessage, AdminMessageList, AudiencePreview, MessageAudience,
} from "@/lib/types";

// A non-admin (403) gets the 404 page, also when a page's data request is faster than the layout check
const apiFetch = <T>(...args: Parameters<typeof rawFetch<T>>) => orNotFound(rawFetch<T>(...args));

// Super-admin API. Everything here is also checked by the backend, so a
// non-admin gets 403 no matter what the pages show.

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

export function parseRange(value?: string): RangeDays {
  const days = Number(value);
  return (RANGES as readonly number[]).includes(days) ? (days as RangeDays) : 30;
}

export const PLATFORMS: AdminPlatform[] = ["web", "android", "ios"];

export function parsePlatform(value?: string): AdminPlatform | undefined {
  return PLATFORMS.find((p) => p === value);
}

// Last `days` days including today, as the backend's from/to dates (UTC dates)
function rangeQuery(days: RangeDays) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export async function getAdminDashboard(days: RangeDays, platform?: AdminPlatform) {
  const query = { ...rangeQuery(days), platform };
  const [overview, signups, activity, breakdowns, platforms] = await Promise.all([
    apiFetch<AdminOverview>("/admin/overview", { query }),
    apiFetch<AdminSignups>("/admin/signups", { query }),
    apiFetch<AdminActivity>("/admin/activity", { query: rangeQuery(days) }),
    apiFetch<AdminBreakdowns>("/admin/breakdowns"),
    apiFetch<AdminPlatforms>("/admin/platforms"),
  ]);
  return { overview, signups, activity, breakdowns, platforms };
}

export function getAdminUsers(query: { search?: string; status?: string; platform?: string; page?: number }) {
  return apiFetch<AdminUserList>("/admin/users", { query: { ...query, limit: 20 } });
}

export function getAdminMessages(page: number) {
  return apiFetch<AdminMessageList>("/admin/messages", { query: { page, limit: 20 } });
}

export function getAdminMessage(id: string) {
  return apiFetch<{ message: AdminMessage; failures: { _id: string; name?: string; address: string; error?: string }[] }>(`/admin/messages/${id}`);
}

export function previewAudience(audience: MessageAudience) {
  return apiFetch<AudiencePreview>("/admin/messages/audience", { method: "POST", body: { audience } });
}
