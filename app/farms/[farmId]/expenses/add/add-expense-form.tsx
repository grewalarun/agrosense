"use client";
import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { createExpenseAction } from "@/lib/actions/expenses";
import { useTranslations } from "next-intl";
import { EXPENSE_CATEGORIES, fmt } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { CycleStatus, ExpenseCategory } from "@/lib/types";
import Spinner from "@/components/Spinner";

type CycleOption = { cycleId: string; label: string; season: string; status: CycleStatus };

const today = () => new Date().toISOString().slice(0, 10);

export default function AddExpenseForm({ farmId, cycles, initialCycleId }: {
  farmId: string;
  cycles: CycleOption[];
  initialCycleId: string;
}) {
  const t = useTranslations("addExpense");
  const tc = useTranslations("common");
  const f = useFormatters();
  const emptyForm = { cycleId: initialCycleId, category: "" as ExpenseCategory | "", description: "", amount: "", date: today(), notes: "" };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; }); };
  const selectedCycle = cycles.find(c => c.cycleId === form.cycleId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.cycleId) e.cycleId = t("errors.crop");
    if (!form.category) e.category = t("errors.category");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = t("errors.amount");
    if (!form.date) e.date = t("errors.date");
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const result = await createExpenseAction(form.cycleId, {
      category: form.category as ExpenseCategory,
      description: form.description.trim() || undefined,
      notes: form.notes.trim() || undefined,
      amount: Number(form.amount),
      date: form.date,
    });
    setSaving(false);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setSaved(true);
  };

  if (saved) return (
    <div><TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle2 size={40} className="text-primary-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-1">{t("added")}</h2>
          <p className="text-sm text-gray-500 mb-5">{t("addedFor", { amount: fmt(Number(form.amount)), what: form.description || f.category(form.category as ExpenseCategory) })}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[
              { l: t("crop"), v: selectedCycle ? `${selectedCycle.label} · ${selectedCycle.season}` : "" },
              { l: t("category"), v: f.category(form.category as ExpenseCategory) },
              ...(form.description ? [{ l: t("description"), v: form.description }] : []),
              { l: t("amount"), v: fmt(Number(form.amount)) },
              { l: t("date"), v: f.date(form.date) },
            ].map(r => (
              <div key={r.l} className="flex justify-between text-sm"><span className="text-gray-400">{r.l}</span><span className="font-medium text-gray-700 text-right">{r.v}</span></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSaved(false); setForm({ ...emptyForm, cycleId: form.cycleId, date: form.date }); }} className="btn-secondary flex-1 justify-center">{t("addAnother")}</button>
            <Link href={`/farms/${farmId}/crop-cycles/${form.cycleId}`} className="btn-primary flex-1 justify-center">{t("viewCrop")}</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div><TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/expenses`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> {tc("back")}
        </Link>
        {cycles.length === 0 ? (
          <div className="card p-6 text-center space-y-3">
            <p className="text-sm text-gray-600">{t("noCrops")}</p>
            <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary inline-flex">{t("plantCrop")}</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800">{t("details")}</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">{t("crop")} <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {cycles.map(c => (
                    <button key={c.cycleId} type="button" onClick={() => set("cycleId", c.cycleId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 text-left transition-all ${form.cycleId === c.cycleId ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                      {c.label}
                      <span className="block text-gray-400 font-normal">{c.season} · {f.status(c.status)}</span>
                    </button>
                  ))}
                </div>
                {errors.cycleId && <p className="text-red-500 text-xs mt-1">{errors.cycleId}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">{t("category")} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPENSE_CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => set("category", c.value)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${form.category === c.value ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-primary-200"}`}>
                      <div className="text-xl mb-0.5">{c.emoji}</div>
                      <p className="text-xs font-medium text-gray-700 leading-tight">{f.category(c.value)}</p>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("description")}</label>
                <input className="input" placeholder={t("descriptionPlaceholder")} value={form.description} onChange={e => set("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("amountRupees")} <span className="text-red-500">*</span></label>
                  <input type="number" min="1" step="0.01" className="input" placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("date")} <span className="text-red-500">*</span></label>
                  <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("notes")}</label>
                <textarea rows={2} className="input resize-none" placeholder={t("notesPlaceholder")} value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>
            </div>
            {form.amount && !isNaN(Number(form.amount)) && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">{form.category ? f.category(form.category) : t("expense")}{selectedCycle ? ` · ${selectedCycle.label}` : ""}</span>
                <span className="text-lg font-bold text-red-600">-{fmt(Number(form.amount))}</span>
              </div>
            )}
            {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-2.5">{saving && <Spinner />}{saving ? tc("saving") : t("submit")}</button>
          </form>
        )}
      </main>
    </div>
  );
}
