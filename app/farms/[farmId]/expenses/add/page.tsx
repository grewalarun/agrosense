"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { FARMS } from "@/lib/data";

const CATEGORIES = [
  { name: "Seeds", emoji: "🌱" }, { name: "Fertilizer", emoji: "🧪" }, { name: "Pesticide", emoji: "🪲" },
  { name: "Labour", emoji: "👷" }, { name: "Equipment", emoji: "🚜" }, { name: "Irrigation", emoji: "💧" },
  { name: "Transport", emoji: "🚛" }, { name: "Storage", emoji: "🏚️" }, { name: "Other", emoji: "📦" },
];

export default function AddExpensePage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const farm = FARMS.find(f => f.id === farmId);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ category: "", description: "", amount: "", date: "", fieldId: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };
  const selectedField = farm?.fields.find(f => f.id === form.fieldId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category) e.category = "Select a category";
    if (!form.description.trim()) e.description = "Enter a description";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    if (!form.date) e.date = "Select date";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div><TopBar title="Add Expense" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle2 size={40} className="text-primary-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-1">Expense Added!</h2>
          <p className="text-sm text-gray-500 mb-5">₹{Number(form.amount).toLocaleString("en-IN")} for {form.description}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[{ l: "Category", v: form.category }, { l: "Description", v: form.description }, { l: "Amount", v: `₹${Number(form.amount).toLocaleString("en-IN")}` }, { l: "Date", v: form.date }, ...(selectedField ? [{ l: "Field", v: selectedField.name }] : [])].map(r => (
              <div key={r.l} className="flex justify-between text-sm"><span className="text-gray-400">{r.l}</span><span className="font-medium text-gray-700">{r.v}</span></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm({ category: "", description: "", amount: "", date: "", fieldId: "", notes: "" }); }} className="btn-secondary flex-1 justify-center">Add Another</button>
            <Link href={`/farms/${farmId}/expenses`} className="btn-primary flex-1 justify-center">View Expenses</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div><TopBar title="Add Expense" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/expenses`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Expense Details</h3>
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.name} type="button" onClick={() => set("category", c.name)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${form.category === c.name ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-primary-200"}`}>
                    <div className="text-xl mb-0.5">{c.emoji}</div>
                    <p className="text-xs font-medium text-gray-700">{c.name}</p>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-500">*</span></label>
              <input className="input" placeholder="e.g. DAP fertilizer 50kg bag…" value={form.description} onChange={e => set("description", e.target.value)} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" className="input" placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
            </div>
            {/* Field (optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Link to field <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => set("fieldId", "")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${!form.fieldId ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500"}`}>
                  Farm-wide
                </button>
                {farm?.fields.map(f => (
                  <button key={f.id} type="button" onClick={() => set("fieldId", f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${form.fieldId === f.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500"}`}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea rows={2} className="input resize-none" placeholder="Vendor name, receipt no…" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          {/* Amount preview */}
          {form.amount && !isNaN(Number(form.amount)) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">{form.category || "Expense"} {selectedField ? `· ${selectedField.name}` : ""}</span>
              <span className="text-lg font-bold text-red-600">-₹{Number(form.amount).toLocaleString("en-IN")}</span>
            </div>
          )}
          <button type="submit" className="btn-primary w-full justify-center py-2.5">Add Expense ✓</button>
        </form>
      </main>
    </div>
  );
}
