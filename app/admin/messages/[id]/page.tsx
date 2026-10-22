import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import MessageStatusBadge from "@/components/admin/MessageStatusBadge";
import SendProgress from "@/components/admin/SendProgress";
import { getAdminMessage } from "@/lib/api/admin";
import { orNotFound } from "@/lib/dal";
import { previewAudience } from "@/lib/api/admin";
import { getFormatters } from "@/i18n/server";

export default async function MessageDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [{ message, failures }, t, f] = await Promise.all([orNotFound(getAdminMessage(id)), getTranslations("adminMessages"), getFormatters()]);
  // For a draft the audience is resolved again now, so the confirmation shows today's number
  const recipientCount = message.status === "DRAFT" ? (await previewAudience(message.audience)).count : message.targeted;

  return (
    <div>
      <TopBar title={t("detailTitle")} />
      <main className="p-4 lg:p-6 max-w-2xl space-y-4">
        <BackLink href="/admin/messages" label={t("back")} />
        <section className="card p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-bold text-gray-800 text-lg break-words min-w-0">{message.subject}</h2>
            <MessageStatusBadge status={message.status} />
          </div>
          <p className="text-xs text-gray-400">
            {t("created", { date: f.date(message.createdAt) })}{message.sentAt && ` · ${t("sentOn", { date: f.date(message.sentAt) })}`}
          </p>
          <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-lg p-4 break-words">{message.body}</div>
          {message.targeted > 0 && (
            <p className="text-sm text-gray-700">{t("sentSummary", { sent: message.sent, failed: message.failed, pending: message.pending })}</p>
          )}
          <SendProgress id={message.id} status={message.status} targeted={message.targeted} failed={message.failed} recipientCount={recipientCount} />
        </section>

        {failures.length > 0 && (
          <section className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t("failures")}</h3>
            <ul className="divide-y divide-gray-50 text-sm">
              {failures.map((r) => (
                <li key={r._id} className="py-2">
                  <p className="text-gray-800">{r.name} <span className="text-xs text-gray-400 break-all">{r.address}</span></p>
                  {r.error && <p className="text-xs text-red-500">{r.error}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
