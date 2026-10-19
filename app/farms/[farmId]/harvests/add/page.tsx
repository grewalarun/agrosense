"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { FARMS } from "@/lib/data";

const QUALITY = [
  { grade: "A", label: "Grade A", desc: "Premium quality, no defects", color: "border-primary-500 bg-primary-50 text-primary-700" },
  { grade: "B", label: "Grade B", desc: "Good quality, minor issues", color: "border-accent-500 bg-accent-50 text-accent-700" },
  { grade: "C", label: "Grade C", desc: "Average quality, some defects", color: "border-gray-400 bg-gray-50 text-gray-700" },
];

export default function AddHarvestPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const farm = FARMS.find(f => f.id === farmId);
  const activeFields = farm?.fields.filter(f => f.status === "Active") ?? [];

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ fieldId: "", crop: "", date: "", quantity: "", unit: "Quintal", quality: "A", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const selectedField = farm?.fields.find(f => f.id === form.fieldId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fieldId) e.fieldId = "Select a field";
    if (!form.crop.trim()) e.crop = "Enter crop name";
    if (!form.date) e.date = "Select harvest date";
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) e.quantity = "Enter valid quantity";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div><TopBar title="Record Harvest" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={32} className="text-primary-600" />
          </div>
          <div className="text-4xl mb-2">🌾</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Harvest Recorded!</h2>
          <p className="text-sm text-gray-500 mb-5">{form.quantity} {form.unit} of <span className="font-semibold text-primary-700">{form.crop}</span> from {selectedField?.name}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[{ l: "Field", v: selectedField?.name ?? "" }, { l: "Crop", v: form.crop }, { l: "Date", v: form.date }, { l: "Quantity", v: `${form.quantity} ${form.unit}` }, { l: "Quality", v: `Grade ${form.quality}` }].map(r => (
              <div key={r.l} className="flex justify-between text-sm"><span className="text-gray-400">{r.l}</span><span className="font-medium text-gray-700">{r.v}</span></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm({ fieldId: "", crop: "", date: "", quantity: "", unit: "Quintal", quality: "A", notes: "" }); }} className="btn-secondary flex-1 justify-center">Add Another</button>
            <Link href={`/farms/${farmId}/harvests`} className="btn-primary flex-1 justify-center">View Harvests</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div><TopBar title="Record Harvest" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/harvests`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> Back to Harvests
        </Link>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Harvest Details</h3>
            {/* Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Field <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {activeFields.map(f => (
                  <button key={f.id} type="button" onClick={() => { set("fieldId", f.id); if (f.currentCrop) set("crop", f.currentCrop); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.fieldId === f.id ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-primary-200"}`}>
                    <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                    {f.currentCrop && <p className="text-xs text-primary-600 mt-0.5">🌾 {f.currentCrop}</p>}
                  </button>
                ))}
              </div>
              {errors.fieldId && <p className="text-red-500 text-xs mt-1">{errors.fieldId}</p>}
            </div>
            {/* Crop */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Crop name <span className="text-red-500">*</span></label>
              <input className="input" placeholder="e.g. Wheat, Potato…" value={form.crop} onChange={e => set("crop", e.target.value)} />
              {errors.crop && <p className="text-red-500 text-xs mt-1">{errors.crop}</p>}
            </div>
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harvest date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="number" step="0.1" min="0.1" className="input" placeholder="e.g. 40" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
                <select className="input w-36" value={form.unit} onChange={e => set("unit", e.target.value)}>
                  {["Quintal", "Ton", "Kg", "Maund"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            {/* Quality */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Quality grade</label>
              <div className="grid grid-cols-3 gap-2">
                {QUALITY.map(q => (
                  <button key={q.grade} type="button" onClick={() => set("quality", q.grade)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${form.quality === q.grade ? q.color : "border-gray-100 hover:border-gray-300"}`}>
                    <p className="text-sm font-bold">{q.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea rows={2} className="input resize-none" placeholder="Observations, storage location…" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5">Record Harvest ✓</button>
        </form>
      </main>
    </div>
  );
}
