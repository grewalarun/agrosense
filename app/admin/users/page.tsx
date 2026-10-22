import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import TopBar from "@/components/TopBar";
import FilterChips from "@/components/admin/FilterChips";
import UserStatusButton from "@/components/admin/UserStatusButton";
import { getAdminUsers } from "@/lib/api/admin";
import { getFormatters } from "@/i18n/server";
import { LOCALE_NAMES, isLocale } from "@/i18n/config";

type UsersParams = { search?: string; status?: string; page?: string };

export default async function AdminUsersPage(props: { searchParams: Promise<UsersParams> }) {
  const sp = await props.searchParams;
  const status = sp.status === "enabled" || sp.status === "disabled" ? sp.status : undefined;
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [list, t, f] = await Promise.all([getAdminUsers({ search, status, page }), getTranslations("admin"), getFormatters()]);
  const pages = Math.max(1, Math.ceil(list.total / list.limit));

  const href = (next: Partial<UsersParams>) => {
    const params = new URLSearchParams();
    const merged = { search, status, ...next };
    if (merged.search) params.set("search", merged.search);
    if (merged.status) params.set("status", merged.status);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  };

  return (
    <div>
      <TopBar title={t("usersTitle")} />
      <main className="p-4 lg:p-6 space-y-4 max-w-6xl">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <form action="/admin/users" className="flex gap-2 flex-1 min-w-60 max-w-md">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="search" defaultValue={search} placeholder={t("searchPlaceholder")} className="input pl-9" aria-label={t("search")} />
            </div>
            <button type="submit" className="btn-secondary">{t("search")}</button>
          </form>
          <FilterChips chips={[
            { label: t("filterAll"), href: href({ status: undefined, page: "1" }), active: !status },
            { label: t("enabled"), href: href({ status: "enabled", page: "1" }), active: status === "enabled" },
            { label: t("disabled"), href: href({ status: "disabled", page: "1" }), active: status === "disabled" },
          ]} />
        </div>

        <p className="text-xs text-gray-500">{t("total", { count: list.total })}</p>

        <div className="card overflow-x-auto">
          {list.users.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">{t("noUsers")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-medium">{t("colName")}</th>
                  <th className="p-3 font-medium">{t("colLanguage")}</th>
                  <th className="p-3 font-medium">{t("colJoined")}</th>
                  <th className="p-3 font-medium text-right">{t("colFarms")}</th>
                  <th className="p-3 font-medium">{t("colLastActive")}</th>
                  <th className="p-3 font-medium">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {list.users.map((u) => {
                  const lastSeen = u.lastActiveAt ?? u.lastRecordAt;
                  return (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 align-top">
                      <td className="p-3 min-w-48">
                        <p className="font-medium text-gray-800">
                          {u.name} {u.isAdmin && <span className="badge-yellow ml-1">{t("adminBadge")}</span>}
                        </p>
                        <p className="text-xs text-gray-500 break-all">{u.email}</p>
                        <p className="text-xs text-gray-400">
                          {u.signIn.map((s) => (s === "google" ? t("viaGoogle") : t("viaPassword"))).join(" + ")}
                          {u.platform && ` · ${t(u.platform)}`}
                          {u.emailOptOut && ` · ${t("optedOut")}`}
                        </p>
                      </td>
                      <td className="p-3 whitespace-nowrap">{u.language && isLocale(u.language) ? LOCALE_NAMES[u.language].native : u.language}</td>
                      <td className="p-3 whitespace-nowrap">{f.date(u.createdOn)}</td>
                      <td className="p-3 text-right tabular-nums">{u.farms}</td>
                      <td className="p-3 whitespace-nowrap">{lastSeen ? f.date(lastSeen) : <span className="text-gray-400">{t("never")}</span>}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={u.status === "enabled" ? "badge-active" : "badge-empty"}>{u.status === "enabled" ? t("enabled") : t("disabled")}</span>
                          {u.status === "enabled" && !u.emailOptOut && (
                            <Link href={`/admin/messages/new?user=${u.id}&name=${encodeURIComponent(u.name)}`}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                              {t("emailUser")}
                            </Link>
                          )}
                          {!u.isAdmin && <UserStatusButton userId={u.id} name={u.name} status={u.status} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <nav className="flex items-center justify-between text-sm" aria-label="pagination">
            {page > 1 ? <Link className="btn-secondary" href={href({ page: String(page - 1) })}>{t("previous")}</Link> : <span />}
            <span className="text-xs text-gray-500">{t("pageOf", { page, pages })}</span>
            {page < pages ? <Link className="btn-secondary" href={href({ page: String(page + 1) })}>{t("next")}</Link> : <span />}
          </nav>
        )}
      </main>
    </div>
  );
}
