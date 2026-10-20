"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import Spinner from "@/components/Spinner";
import { deleteExpenseAction, updateExpenseAction } from "@/lib/actions/expenses";
import { deleteSaleAction, updateSaleAction } from "@/lib/actions/harvests";
import { useTranslations } from "next-intl";
import { EXPENSE_CATEGORIES, categoryColor, fmt } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { Expense, ExpenseCategory, Sale } from "@/lib/types";

// Save button + error shared by both edit forms; stays busy until the refreshed page arrives
function useSave() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState("");
  const save = async (run: () => Promise<{ error?: string }>, onDone: () => void) => {
    setSaving(true); setError("");
    const result = await run();
    setSaving(false);
    if (result.error !== undefined) { setError(result.error); return; }
    startRefresh(() => { router.refresh(); onDone(); });
  };
  return { busy: saving || refreshing, error, setError, save };
}

function EditButtons({ busy, onCancel }: { busy: boolean; onCancel: () => void }) {
  const tc = useTranslations("common");
  return (
    <div className="flex gap-2 justify-end">
      <button type="button" onClick={onCancel} disabled={busy} className="btn-secondary text-xs py-1.5 px-3">{tc("cancel")}</button>
      <button type="submit" disabled={busy} className="btn-primary text-xs py-1.5 px-3">{busy && <Spinner />}{busy ? tc("saving") : tc("save")}</button>
    </div>
  );
}

export function ExpenseRow({ expense, editable }: { expense: Expense; editable: boolean }) {
  const t = useTranslations("entries");
  const f = useFormatters();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    category: expense.category,
    description: expense.description ?? "",
    amount: String(expense.amount),
    date: expense.date.slice(0, 10),
    notes: expense.notes ?? "",
  });
  const { busy, error, setError, save } = useSave();
  const set = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
  const label = expense.description || f.category(expense.category);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const amount = Number(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) { setError(t("errors.amount")); return; }
    if (!form.date) { setError(t("errors.date")); return; }
    save(() => updateExpenseAction(expense._id, {
      category: form.category,
      description: form.description.trim(),
      notes: form.notes.trim(),
      amount,
      date: form.date,
    }), () => setEditing(false));
  };

  if (editing) {
    return (
      <form id={`expense-${expense._id}`} onSubmit={submit} className="bg-gray-50 rounded-lg p-3 space-y-2 scroll-mt-20">
        <div className="grid grid-cols-2 gap-2">
          <select className="input text-xs" value={form.category} onChange={e => set("category", e.target.value as ExpenseCategory)} aria-label={t("category")}>
            {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {f.category(c.value)}</option>)}
          </select>
          <input type="date" className="input text-xs" value={form.date} onChange={e => set("date", e.target.value)} aria-label={t("date")} />
          <input className="input text-xs" placeholder={t("description")} value={form.description} onChange={e => set("description", e.target.value)} aria-label={t("description")} />
          <input type="number" min="0.01" step="0.01" className="input text-xs" placeholder={t("amount")} value={form.amount} onChange={e => set("amount", e.target.value)} aria-label={t("amountLabel")} />
        </div>
        <input className="input text-xs" placeholder={t("notesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} aria-label={t("notes")} />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <EditButtons busy={busy} onCancel={() => { setEditing(false); setError(""); }} />
      </form>
    );
  }

  return (
    <div id={`expense-${expense._id}`} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0 scroll-mt-20">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className={`px-1.5 py-px rounded-full ${categoryColor(expense.category)}`}>{f.category(expense.category)}</span>
          {f.date(expense.date)}
        </p>
        {expense.notes && <p className="text-xs text-gray-400 mt-0.5">{expense.notes}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-semibold text-red-500 tabular-nums">-{fmt(expense.amount)}</span>
        {editable && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="text-gray-300 hover:text-primary-600" title={t("editItem", { label })}><Pencil size={13} /></button>
            <ConfirmDeleteButton action={() => deleteExpenseAction(expense._id)} label={label} />
          </>
        )}
      </div>
    </div>
  );
}

// maxQuantity = this sale's quantity + what is still unsold in its harvest
export function SaleRow({ sale, editable, maxQuantity }: { sale: Sale; editable: boolean; maxQuantity: number }) {
  const t = useTranslations("entries");
  const f = useFormatters();
  const u = f.unit(sale.unit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    quantity: String(sale.quantity),
    pricePerUnit: String(sale.pricePerUnit),
    buyer: sale.buyer ?? "",
    date: sale.date.slice(0, 10),
  });
  const { busy, error, setError, save } = useSave();
  const set = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
  const total = (Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const quantity = Number(form.quantity);
    const pricePerUnit = Number(form.pricePerUnit);
    if (!form.quantity || isNaN(quantity) || quantity <= 0) { setError(t("errors.quantity")); return; }
    if (quantity > maxQuantity) { setError(t("errors.overStock", { max: maxQuantity, unit: u })); return; }
    if (form.pricePerUnit === "" || isNaN(pricePerUnit) || pricePerUnit < 0) { setError(t("errors.rate")); return; }
    if (!form.date) { setError(t("errors.date")); return; }
    save(() => updateSaleAction(sale._id, { quantity, pricePerUnit, buyer: form.buyer.trim(), date: form.date }), () => setEditing(false));
  };

  if (editing) {
    return (
      <form id={`sale-${sale._id}`} onSubmit={submit} className="bg-gray-50 rounded-lg p-3 space-y-2 scroll-mt-20">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input type="number" min="0.001" step="0.001" className="input text-xs" value={form.quantity} onChange={e => set("quantity", e.target.value)} aria-label={t("quantityLabel", { unit: u })} />
            <p className="text-[11px] text-gray-400 mt-0.5">{t("quantityMax", { unit: u, max: maxQuantity })}</p>
          </div>
          <div>
            <input type="number" min="0" step="0.01" className="input text-xs" value={form.pricePerUnit} onChange={e => set("pricePerUnit", e.target.value)} aria-label={t("rateLabel", { unit: u })} />
            <p className="text-[11px] text-gray-400 mt-0.5">{t("rateHint", { unit: u })}</p>
          </div>
          <input className="input text-xs" placeholder={t("buyer")} value={form.buyer} onChange={e => set("buyer", e.target.value)} aria-label={t("buyer")} />
          <input type="date" className="input text-xs" value={form.date} onChange={e => set("date", e.target.value)} aria-label={t("saleDate")} />
        </div>
        <p className="text-xs text-gray-600">{t.rich("newTotal", { amount: fmt(total), b: chunks => <b>{chunks}</b> })}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <EditButtons busy={busy} onCancel={() => { setEditing(false); setError(""); }} />
      </form>
    );
  }

  return (
    <div id={`sale-${sale._id}`} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-gray-50 last:border-0 scroll-mt-20">
      <div className="min-w-0">
        <p className="font-medium text-gray-700">{sale.quantity} {u}{sale.buyer && ` ${t("toBuyer", { buyer: sale.buyer })}`}</p>
        <p className="text-gray-400">{fmt(sale.pricePerUnit)}/{u} · {f.date(sale.date)}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-bold text-primary-600 tabular-nums">+{fmt(sale.totalAmount)}</span>
        {editable && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="text-gray-300 hover:text-primary-600" title={t("editSale")}><Pencil size={13} /></button>
            <ConfirmDeleteButton action={() => deleteSaleAction(sale._id)} label={t("sale")} />
          </>
        )}
      </div>
    </div>
  );
}
