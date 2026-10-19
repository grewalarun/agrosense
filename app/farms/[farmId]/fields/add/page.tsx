"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { ChevronLeft, MapPin, Droplets, Layers, Ruler, CheckCircle2 } from "lucide-react";

const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Silty", "Clayey Loam", "Black Cotton", "Red Laterite"];
const IRRIGATION_TYPES = ["Tube Well", "Drip", "Canal", "Sprinkler", "Flood", "Rainwater", "Borewell", "River Lift"];

export default function AddFieldPage() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.farmId as string;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    area: "",
    areaUnit: "Acre",
    soil: "",
    irrigation: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Field name is required";
    if (!form.area || isNaN(Number(form.area)) || Number(form.area) <= 0)
      e.area = "Enter a valid area";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.soil) e.soil = "Select a soil type";
    if (!form.irrigation) e.irrigation = "Select an irrigation source";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <TopBar title="Add Field" />
        <main className="p-4 lg:p-6 max-w-lg mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Field Added!</h2>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-primary-700">{form.name}</span> has been added to your farm.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 mt-4">
              {[
                { label: "Area", value: `${form.area} ${form.areaUnit}` },
                { label: "Soil Type", value: form.soil },
                { label: "Irrigation", value: form.irrigation },
                ...(form.notes ? [{ label: "Notes", value: form.notes }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSubmitted(false); setStep(1); setForm({ name: "", area: "", areaUnit: "Acre", soil: "", irrigation: "", notes: "" }); }}
                className="btn-secondary flex-1 justify-center">
                Add Another
              </button>
              <Link href={`/farms/${farmId}/fields`} className="btn-primary flex-1 justify-center">
                View Fields
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Add Field" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        {/* Back */}
        <Link href={`/farms/${farmId}/fields`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Fields
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                s < step ? "bg-primary-600 text-white" :
                s === step ? "bg-primary-600 text-white ring-4 ring-primary-100" :
                "bg-gray-100 text-gray-400"
              }`}>
                {s < step ? <CheckCircle2 size={14} /> : s}
              </div>
              <span className={`text-xs font-medium ${s === step ? "text-primary-700" : "text-gray-400"}`}>
                {s === 1 ? "Basic Info" : "Soil & Water"}
              </span>
              {s < 2 && <div className={`flex-1 h-0.5 rounded ${step > s ? "bg-primary-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="card p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Field Details</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input"
                  placeholder="e.g. North Field, Field 5, Bada Kheth…"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Area <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input"
                    placeholder="e.g. 1.5"
                    value={form.area}
                    onChange={e => set("area", e.target.value)}
                  />
                  <select
                    className="input w-32"
                    value={form.areaUnit}
                    onChange={e => set("areaUnit", e.target.value)}
                  >
                    <option>Acre</option>
                    <option>Hectare</option>
                    <option>Bigha</option>
                    <option>Kanal</option>
                  </select>
                </div>
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Any additional details about this field…"
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                />
              </div>

              <button type="button" onClick={handleNext} className="btn-primary w-full justify-center py-2.5">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Layers size={16} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Soil & Irrigation</h3>
              </div>

              {/* Soil type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Soil Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SOIL_TYPES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("soil", s)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        form.soil === s
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-100 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/40"
                      }`}
                    >
                      <span className="mr-1.5">
                        {s === "Loamy" ? "🟫" : s === "Sandy" ? "🟡" : s === "Clay" ? "🔴" : s === "Black Cotton" ? "⚫" : "🟤"}
                      </span>
                      {s}
                    </button>
                  ))}
                </div>
                {errors.soil && <p className="text-red-500 text-xs mt-1">{errors.soil}</p>}
              </div>

              {/* Irrigation */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Irrigation Source <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {IRRIGATION_TYPES.map(ir => (
                    <button
                      key={ir}
                      type="button"
                      onClick={() => set("irrigation", ir)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        form.irrigation === ir
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-100 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50/40"
                      }`}
                    >
                      <span className="mr-1.5">
                        {ir === "Drip" ? "💧" : ir === "Canal" ? "🌊" : ir === "Sprinkler" ? "🚿" : ir === "Rainwater" ? "🌧️" : "⛽"}
                      </span>
                      {ir}
                    </button>
                  ))}
                </div>
                {errors.irrigation && <p className="text-red-500 text-xs mt-1">{errors.irrigation}</p>}
              </div>

              {/* Summary preview */}
              {(form.soil || form.irrigation) && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-accent-700 mb-2">📋 Field Summary</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Name</span>
                      <span className="font-semibold text-gray-700">{form.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Area</span>
                      <span className="font-semibold text-gray-700">{form.area} {form.areaUnit}</span>
                    </div>
                    {form.soil && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Soil</span>
                        <span className="font-semibold text-gray-700">{form.soil}</span>
                      </div>
                    )}
                    {form.irrigation && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Irrigation</span>
                        <span className="font-semibold text-gray-700">{form.irrigation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  ← Back
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center py-2.5">
                  Add Field ✓
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
