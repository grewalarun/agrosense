"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Lock, Trash2 } from "lucide-react";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changeStatus = async (next: CycleStatus) => {
    setBusy(true); setError("");
    const result = await updateCycleStatusAction(cycleId, next);
    setBusy(false);
    if (result.error !== undefined) setError(result.error);
    else router.refresh();
  };

  const remove = async () => {
    setBusy(true); setError("");
    const result = await deleteCycleAction(cycleId);
    if (result.error !== undefined) { setBusy(false); setError(result.error); return; }
    router.push(`/farms/${farmId}/fields/${fieldId}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "PLANNED" && (
          <button onClick={() => changeStatus("ACTIVE")} disabled={busy} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
            <Play size={12} /> Start crop
          </button>
        )}
        {status === "HARVESTED" && (
          <button onClick={() => changeStatus("CLOSED")} disabled={busy} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            title="Locks expenses, harvests and sales for this crop">
            <Lock size={12} /> Close season
          </button>
        )}
        {status === "CLOSED" && (
          <button onClick={() => changeStatus("HARVESTED")} disabled={busy} className="btn-secondary text-xs py-1.5 px-3">
            Reopen
          </button>
        )}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} disabled={busy}
            className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1">
            <Trash2 size={12} /> Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-red-600">Delete {cropName} with all its expenses, harvests and sales?</span>
            <button onClick={remove} disabled={busy} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
            <button onClick={() => setConfirmDelete(false)} disabled={busy} className="text-xs text-gray-500 hover:underline">Cancel</button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
