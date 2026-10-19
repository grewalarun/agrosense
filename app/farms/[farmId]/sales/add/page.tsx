"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { FARMS, HARVESTS } from "@/lib/data";

const BUYERS = ["Mandi / APMC", "Local Trader", "Direct Consumer", "FPO / Cooperative", "Export Agent", "Online Platform", "Other"];

export default function AddSalePage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const farm = FARMS.find(f => f.id === farmId);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ crop: "", quantity: "", unit: "Quintal", pricePerUnit: "", buyer: "", buyerCustom: "", date: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const totalAmount = (Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0);
  const buyerName = form.buyer === "Other" ? form.buyerCustom : form.buyer;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.crop.trim()) e.crop = "Enter crop name";
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) e.quantity = "Enter valid quantity";
    if (!form.pricePerUnit || isNaN(Number(form.pricePerUnit)) || Number(form.pricePerUnit) <= 0) e.pricePerUnit = "Enter valid price";
    if (!form.buyer) e.buyer = "Select a buyer type";
    if (form.buyer === "Other" && !form.buyerCustom.trim()) e.buyerCustom = "Enter buyer name";
    if (!form.date) e.date = "Select sale date";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div><TopBar title="Record Sale" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle2 size={40} className="text-primary-600 mx-auto mb-3" />
          <div className="text-4xl mb-2">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sale Recorded!</h2>
          <p className="text-sm text-gray-500 mb-2">Total: <span className="font-bold text-primary-600 text-lg">₹{totalAmount.toLocaleString("en-IN")}</span></p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[{ l: "Crop", v: form.crop }, { l: "Quantity", v: `${form.quantity} ${form.unit}` }, { l: "Rate", v: `₹${form.pricePerUnit}/${form.unit}` }, { l: "Total", v: `₹${totalAmount.toLocaleString("en-IN")}` }, { l: "Buyer", v: buyerName }, { l: "Date", v: form.date }].map(r => (
              <div key={r.l} className="flex justify-between text-sm"><span className="text-gray-400">{r.l}</span><span className="font-medium text-gray-700">{r.v}</span></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm({ crop: "", quantity: "", unit: "Quintal", pricePerUnit: "", buyer: "", buyerCustom: "", date: "", notes: "" }); }} className="btn-secondary flex-1 justify-center">Add Another</button>
            <Link href={`/farms/${farmId}/sales`} className="btn-primary flex-1 justify-center">View Sales</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div><TopBar title="Record Sale" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/sales`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Sale Details</h3>
            {/* Crop */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Crop <span className="text-red-500">*</span></label>
              <input className="input" placeholder="e.g. Wheat, Potato, Rice…" value={form.crop} onChange={e => set("crop", e.target.value)} />
              {errors.crop && <p className="text-red-500 text-xs mt-1">{errors.crop}</p>}
              {/* Quick pick from harvests */}
              {HARVESTS.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-gray-400">Quick pick:</span>
                  {[...new Set(HARVESTS.map(h => h.crop))].map(c => (
                    <button key={c} type="button" onClick={() => set("crop", c)}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100">
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Qty + Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                <div className="flex gap-1.5">
                  <input type="number" step="0.1" className="input" placeholder="40" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
                  <select className="input w-24" value={form.unit} onChange={e => set("unit", e.target.value)}>
                    {["Quintal", "Ton", "Kg", "Maund"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rate per {form.unit} (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" className="input" placeholder="2000" value={form.pricePerUnit} onChange={e => set("pricePerUnit", e.target.value)} />
                {errors.pricePerUnit && <p className="text-red-500 text-xs mt-1">{errors.pricePerUnit}</p>}
              </div>
            </div>
            {/* Live total */}
            {totalAmount > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">{form.quantity} {form.unit} × ₹{form.pricePerUnit}</span>
                <span className="text-lg font-bold text-primary-600">= ₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {/* Buyer */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Buyer type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {BUYERS.map(b => (
                  <button key={b} type="button" onClick={() => set("buyer", b)}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-medium text-left transition-all ${form.buyer === b ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>
                    {b}
                  </button>
                ))}
              </div>
              {errors.buyer && <p className="text-red-500 text-xs mt-1">{errors.buyer}</p>}
              {form.buyer === "Other" && (
                <div className="mt-2">
                  <input className="input" placeholder="Enter buyer name…" value={form.buyerCustom} onChange={e => set("buyerCustom", e.target.value)} />
                  {errors.buyerCustom && <p className="text-red-500 text-xs mt-1">{errors.buyerCustom}</p>}
                </div>
              )}
            </div>
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sale date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea rows={2} className="input resize-none" placeholder="Payment mode, mandi receipt no…" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5">Record Sale ✓</button>
        </form>
      </main>
    </div>
  );
}
