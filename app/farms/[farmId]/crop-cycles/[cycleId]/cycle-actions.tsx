"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Lock, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteCycleAction, updateCycleStatusAction } from "@/lib/actions/cycles";
import type { CycleStatus } from "@/lib/types";

export default function CycleActions({ farmId, fieldId, cycleId, status, cropName }: {
  farmId: string;
  fieldId: string;
  cycleId: string;
  status: CycleStatus;
  cropName: string;
}) {
  const router = useRouter();
  const t = useTranslations("cycleActions");
  const tc = useTranslations("common");
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const busy = saving || refreshing;
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changeStatus = async (next: CycleStatus) => {
    setSaving(true); setError("");
    const result = await updateCycleStatusAction(cycleId, next);
    setSaving(false);
    if (result.error !== undefined) setError(result.error);
    else startRefresh(() => router.refresh());
  };

  const remove = async () => {
    setSaving(true); setError("");
    const result = await deleteCycleAction(cycleId);
    if (result.error !== undefined) { setSaving(false); setError(result.error); return; }
    router.push(`/farms/${farmId}/fields/${fieldId}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "PLANNED" && (
          <button onClick={() => changeStatus("ACTIVE")} disabled={busy} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
            <Play size={12} /> {t("start")}
          </button>
        )}
        {status === "HARVESTED" && (
          <button onClick={() => changeStatus("CLOSED")} disabled={busy} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            title={t("closeTitle")}>
            <Lock size={12} /> {t("close")}
          </button>
        )}
        {status === "CLOSED" && (
          <button onClick={() => changeStatus("HARVESTED")} disabled={busy} className="btn-secondary text-xs py-1.5 px-3">
            {t("reopen")}
          </button>
        )}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} disabled={busy}
            className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1">
            <Trash2 size={12} /> {t("delete")}
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-red-600">{t("confirmDelete", { crop: cropName })}</span>
            <button onClick={remove} disabled={busy} className="text-xs font-semibold text-red-600 hover:underline">{tc("delete")}</button>
            <button onClick={() => setConfirmDelete(false)} disabled={busy} className="text-xs text-gray-500 hover:underline">{tc("cancel")}</button>
          </div>
        )}
      </div>
      {busy && !confirmDelete && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" aria-hidden /> {t("updating")}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
