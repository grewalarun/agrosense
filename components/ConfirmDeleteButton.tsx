"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

// Trash icon that asks for confirmation, then runs a (bound) server action
export default function ConfirmDeleteButton({ action, label }: {
  action: () => Promise<{ error?: string }>;
  label: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState("");
  // Stays busy until the refreshed list has arrived, not just until the delete returns
  const busy = deleting || refreshing;

  const remove = async () => {
    setDeleting(true);
    const result = await action();
    setDeleting(false);
    if (result.error !== undefined) { setError(result.error); setConfirming(false); return; }
    startRefresh(() => router.refresh());
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
      <button onClick={remove} disabled={busy} className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1">
        {busy && <span className="w-3 h-3 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" aria-hidden />}
        {busy ? "Deleting…" : "Delete"}
      </button>
      <button onClick={() => setConfirming(false)} disabled={busy} className="text-xs text-gray-400 hover:underline">Cancel</button>
    </span>
  );
}
