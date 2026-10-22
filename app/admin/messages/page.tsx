import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import TopBar from "@/components/TopBar";
import MessageStatusBadge from "@/components/admin/MessageStatusBadge";
import { getAdminMessages } from "@/lib/api/admin";
import { getFormatters } from "@/i18n/server";

export default async function AdminMessagesPage(props: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await props.searchParams).page) || 1);
  const [list, t, f] = await Promise.all([getAdminMessages(page), getTranslations("adminMessages"), getFormatters()]);
  const pages = Math.max(1, Math.ceil(list.total / list.limit));

  const audience = (m: (typeof list.messages)[number]) =>
    m.audience.type === "all" ? t("audienceAll")
      : m.audience.type === "users" ? t("audienceUsers", { count: m.audience.userIds.length })
      : t("audienceGroup");

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 space-y-4 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">{t("dailyLimit", { used: list.sentToday, cap: list.dailyCap })}</p>
          <Link href="/admin/messages/new" className="btn-primary flex items-center gap-1.5"><Plus size={14} />{t("new")}</Link>
        </div>

        <div className="card overflow-x-auto">
          {list.messages.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">{t("empty")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-medium">{t("colSubject")}</th>
                  <th className="p-3 font-medium">{t("colAudience")}</th>
                  <th className="p-3 font-medium">{t("colStatus")}</th>
                  <th className="p-3 font-medium text-right">{t("colSent")}</th>
                  <th className="p-3 font-medium">{t("colDate")}</th>
                </tr>
              </thead>
              <tbody>
                {list.messages.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="p-3 min-w-48"><Link href={`/admin/messages/${m.id}`} className="font-medium text-primary-700 hover:underline">{m.subject}</Link></td>
                    <td className="p-3 whitespace-nowrap">{audience(m)}</td>
                    <td className="p-3"><MessageStatusBadge status={m.status} /></td>
                    <td className="p-3 text-right tabular-nums whitespace-nowrap">{m.targeted ? `${m.sent} / ${m.targeted}` : "—"}{m.failed > 0 && <span className="text-red-500"> · {m.failed}</span>}</td>
                    <td className="p-3 whitespace-nowrap">{f.date(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <nav className="flex items-center justify-between text-sm">
            {page > 1 ? <Link className="btn-secondary" href={`/admin/messages?page=${page - 1}`}>←</Link> : <span />}
            <span className="text-xs text-gray-500">{page} / {pages}</span>
            {page < pages ? <Link className="btn-secondary" href={`/admin/messages?page=${page + 1}`}>→</Link> : <span />}
          </nav>
        )}
      </main>
    </div>
  );
}
