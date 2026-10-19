"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteExpenseAction } from "@/lib/actions/expenses";

export default function DeleteExpenseButton({ expenseId, label }: { expenseId: string; label: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    setBusy(true);
    const result = await deleteExpenseAction(expenseId);
    setBusy(false);
    if (result.error !== undefined) { setError(result.error); setConfirming(false); return; }
    router.refresh();
  };

  if (error) return <span className="text-xs text-red-500" title={error}>Can&apos;t delete</span>;
  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-gray-300 hover:text-red-500 transition-colors" title={`Delete ${label}`}>
        <Trash2 size={14} />
      </button>
    );
  }
  return (
    <span className="flex items-center gap-2 justify-end">
      <button onClick={remove} disabled={busy} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
      <button onClick={() => setConfirming(false)} disabled={busy} className="text-xs text-gray-400 hover:underline">Cancel</button>
    </span>
  );
}
