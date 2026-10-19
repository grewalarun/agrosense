"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ChevronRight, CheckCircle2 } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions/farms";
import { AREA_UNITS, IRRIGATION_TYPES, SOIL_TYPES, formatArea } from "@/lib/format";
import type { AreaUnit } from "@/lib/types";

const STEPS = ["Welcome", "Your Farm", "First Field", "Done"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState({ name: "", district: "", state: "", totalArea: "", areaUnit: "ACRE" as AreaUnit });
  const [field, setField] = useState({ name: "Field 1", area: "", soil: "", irrigation: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [farmId, setFarmId] = useState("");

  const setF = (k: string, v: string) => { setFarm(p => ({ ...p, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };
  const setFl = (k: string, v: string) => { setField(p => ({ ...p, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!farm.name.trim()) e.fname = "Farm name is required";
    if (!farm.district.trim()) e.location = "District is required";
    if (!farm.totalArea || isNaN(Number(farm.totalArea)) || Number(farm.totalArea) <= 0) e.area = "Enter total area";
    return e;
  };
  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!field.area || isNaN(Number(field.area)) || Number(field.area) <= 0) e.farea = "Enter field area";
    if (!field.soil) e.soil = "Select soil type";
    if (!field.irrigation) e.irr = "Select irrigation";
    return e;
  };

  const next = () => {
    if (step === 1) { const e = validate1(); if (Object.keys(e).length) { setErrors(e); return; } }
    setStep(s => s + 1);
  };

  const complete = async () => {
    const e = validate2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const result = await completeOnboardingAction(
      {
        name: farm.name.trim(),
        location: { district: farm.district.trim(), state: farm.state.trim() },
        totalArea: Number(farm.totalArea),
        areaUnit: farm.areaUnit,
      },
      {
        name: field.name.trim() || "Field 1",
        area: Number(field.area),
        areaUnit: farm.areaUnit,
        soilType: field.soil,
        irrigationType: field.irrigation,
      }
    );
    setSaving(false);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setFarmId(result.data.farmId);
    setStep(3);
  };

  const unitLabel = AREA_UNITS.find(u => u.value === farm.areaUnit)?.label ?? "";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-primary-800">AgroSense</span>
        </div>

        {/* Progress bar */}
        {step > 0 && step < 3 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              {STEPS.slice(1, 3).map((s, i) => (
                <span key={s} className={step - 1 >= i ? "text-primary-600 font-semibold" : ""}>{s}</span>
              ))}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>
          </div>
        )}

        {/* STEP 0: Welcome */}
        {step === 0 && (
          <div className="card p-6 text-center space-y-5">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-5xl">🌾</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome to AgroSense</h1>
              <p className="text-gray-500 text-sm mt-2">Let&apos;s set up your farm in 2 quick steps. It takes less than 2 minutes.</p>
            </div>
            <div className="text-left space-y-3">
              {[
                { icon: "🏡", text: "Create your farm profile" },
                { icon: "🗺️", text: "Add your first field" },
                { icon: "🌱", text: "Start tracking crops, expenses & profits" },
              ].map(i => (
                <div key={i.text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{i.icon}</span> {i.text}
                </div>
              ))}
            </div>
            <button onClick={next} className="btn-primary w-full justify-center py-3 text-base">
              Get Started <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        )}

        {/* STEP 1: Farm details */}
        {step === 1 && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tell us about your farm</h2>
              <p className="text-xs text-gray-400 mt-0.5">You can add more farms later from the dashboard</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Farm name <span className="text-red-500">*</span></label>
              <input className="input" placeholder="e.g. Grewal Farm, My Farm…" value={farm.name} onChange={e => setF("name", e.target.value)} />
              {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">District <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Moradabad" value={farm.district} onChange={e => setF("district", e.target.value)} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                <input className="input" placeholder="e.g. Uttar Pradesh" value={farm.state} onChange={e => setF("state", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Area <span className="text-red-500">*</span></label>
              <div className="flex gap-1.5">
                <input type="number" step="0.01" min="0.01" className="input" placeholder="e.g. 4" value={farm.totalArea} onChange={e => setF("totalArea", e.target.value)} />
                <select className="input w-32" value={farm.areaUnit} onChange={e => setF("areaUnit", e.target.value)}>
                  {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(0)} className="btn-secondary px-4">← Back</button>
              <button onClick={next} className="btn-primary flex-1 justify-center py-2.5">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2: First field */}
        {step === 2 && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Add your first field</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fields are plots of land within <span className="font-semibold text-primary-600">{farm.name}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Field name</label>
                <input className="input" value={field.name} onChange={e => setFl("name", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Area ({unitLabel}) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" min="0.01" className="input" placeholder="e.g. 1.5" value={field.area} onChange={e => setFl("area", e.target.value)} />
                {errors.farea && <p className="text-red-500 text-xs mt-1">{errors.farea}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Soil type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {SOIL_TYPES.map(s => (
                  <button key={s} type="button" onClick={() => setFl("soil", s)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${field.soil === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {errors.soil && <p className="text-red-500 text-xs mt-1">{errors.soil}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Irrigation <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {IRRIGATION_TYPES.map(ir => (
                  <button key={ir} type="button" onClick={() => setFl("irrigation", ir)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${field.irrigation === ir ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>
                    {ir}
                  </button>
                ))}
              </div>
              {errors.irr && <p className="text-red-500 text-xs mt-1">{errors.irr}</p>}
            </div>
            {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(1)} className="btn-secondary px-4">← Back</button>
              <button onClick={complete} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving ? "Setting up…" : "Complete Setup ✓"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === 3 && (
          <div className="card p-8 text-center space-y-5">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">You&apos;re all set! 🎉</h2>
              <p className="text-gray-500 text-sm mt-2">
                <span className="font-semibold text-primary-700">{farm.name}</span> with {field.name} is ready.
              </p>
            </div>
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-left space-y-2">
              {[
                { label: "Farm", value: farm.name },
                { label: "Location", value: [farm.district, farm.state].filter(Boolean).join(", ") },
                { label: "Total Area", value: formatArea(Number(farm.totalArea), farm.areaUnit, true) },
                { label: "First Field", value: `${field.name} · ${formatArea(Number(field.area), farm.areaUnit)} · ${field.soil}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-semibold text-gray-700">{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push(`/farms/${farmId}`)} className="btn-primary w-full justify-center py-3 text-base">
              Go to my farm →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
