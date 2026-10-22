"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Spinner from "@/components/Spinner";
import { deleteMessageAction } from "@/lib/actions/admin";
import { sendUntilDone } from "@/components/admin/sendLoop";
import type { MessageStatus } from "@/lib/types";

// Buttons on the email details page: send a draft, continue an interrupted send,
// retry failed emails, delete a draft.
export default function SendProgress({ id, status, targeted, failed, recipientCount }: {
  id: string; status: MessageStatus; targeted: number; failed: number; recipientCount?: number;
}) {
  const t = useTranslations("adminMessages");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const send = async (retryFailed: boolean) => {
    setBusy(true); setError(null); setConfirming(false);
    setProgress({ done: 0, total: targeted });
    const result = await sendUntilDone(id, { retryFailed, onProgress: (m) => setProgress({ done: m.sent + m.failed, total: m.targeted }) });
    if (result.error) setError(result.error);
    setBusy(false); setProgress(null);
    router.refresh();
  };

  const remove = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    setBusy(true);
    const result = await deleteMessageAction(id);
    if (result.error !== undefined) { setError(result.error); setBusy(false); return; }
    router.push("/admin/messages");
  };

  return (
    <div className="space-y-3">
      {progress && (
        <div role="status" aria-live="polite" className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 flex items-center gap-2"><Spinner />{t("sending", { sent: progress.done, total: progress.total })}</p>
          <div className="h-2 bg-gray-200 rounded mt-2"><div className="h-2 bg-primary-600 rounded" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div>
        </div>
      )}
      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3" role="alert">{error}</p>}
      {confirming && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-amber-900">{t("confirmSend", { count: recipientCount ?? 0 })}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary" disabled={busy} onClick={() => send(false)}>{t("confirm")}</button>
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>{t("cancel")}</button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && !confirming && <button type="button" className="btn-primary" disabled={busy} onClick={() => setConfirming(true)}>{t("send")}</button>}
        {status === "SENDING" && <button type="button" className="btn-primary" disabled={busy} onClick={() => send(false)}>{busy && <Spinner />}{t("continue")}</button>}
        {(status === "PARTIAL" || status === "FAILED") && failed > 0 && (
          <button type="button" className="btn-primary" disabled={busy} onClick={() => send(true)}>{busy && <Spinner />}{t("retryFailed")}</button>
        )}
        {status === "DRAFT" && <button type="button" className="btn-secondary" disabled={busy} onClick={remove}>{t("delete")}</button>}
      </div>
    </div>
  );
}
