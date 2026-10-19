"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { ChevronLeft, Sprout, CalendarDays, BarChart2, CheckCircle2 } from "lucide-react";
import { FARMS } from "@/lib/data";

const CROPS = [
  { name: "Wheat", emoji: "🌾", season: "Rabi" },
  { name: "Rice", emoji: "🍚", season: "Kharif" },
  { name: "Potato", emoji: "🥔", season: "Rabi" },
  { name: "Sugarcane", emoji: "🎋", season: "Annual" },
  { name: "Mustard", emoji: "🌼", season: "Rabi" },
  { name: "Maize", emoji: "🌽", season: "Kharif" },
  { name: "Cotton", emoji: "☁️", season: "Kharif" },
  { name: "Soybean", emoji: "🫘", season: "Kharif" },
  { name: "Tomato", emoji: "🍅", season: "Zaid" },
  { name: "Onion", emoji: "🧅", season: "Rabi" },
  { name: "Garlic", emoji: "🧄", season: "Rabi" },
  { name: "Pea", emoji: "🫛", season: "Rabi" },
  { name: "Chickpea", emoji: "🫘", season: "Rabi" },
  { name: "Sunflower", emoji: "🌻", season: "Zaid" },
  { name: "Groundnut", emoji: "🥜", season: "Kharif" },
  { name: "Other", emoji: "🌿", season: "Any" },
];

const SEASONS = ["Rabi 2026-27", "Kharif 2026", "Zaid 2026", "Rabi 2027-28"];

export default function AddCropPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const farm = FARMS.find(f => f.id === farmId);
  const fields = farm?.fields ?? [];

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [customCrop, setCustomCrop] = useState("");
  const [form, setForm] = useState({
    fieldId: "",
    crop: "",
    season: "Rabi 2026-27",
    startDate: "",
    expectedHarvestDate: "",
    expectedYield: "",
    yieldUnit: "Quintal",
    seedVariety: "",
    seedQty: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const selectedField = fields.find(f => f.id === form.fieldId);
  const selectedCrop = CROPS.find(c => c.name === form.crop);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fieldId) e.fieldId = "Select a field";
    if (!form.crop) e.crop = "Select a crop";
    if (form.crop === "Other" && !customCrop.trim()) e.customCrop = "Enter crop name";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.expectedYield || isNaN(Number(form.expectedYield)) || Number(form.expectedYield) <= 0)
      e.expectedYield = "Enter expected yield";
    return e;
  };

  const handleNext = () => {
    const e = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  const cropName = form.crop === "Other" ? customCrop : form.crop;

  if (submitted) {
    return (
      <div>
        <TopBar title="Add Crop" />
        <main className="p-4 lg:p-6 max-w-lg mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary-600" />
            </div>
            <div className="text-4xl mb-2">{selectedCrop?.emoji ?? "🌿"}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Crop Cycle Added!</h2>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-primary-700">{cropName}</span> planted on{" "}
              <span className="font-semibold text-gray-700">{selectedField?.name}</span>
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
              {[
                { label: "Field", value: selectedField?.name ?? "—" },
                { label: "Season", value: form.season },
                { label: "Start Date", value: form.startDate },
                ...(form.expectedHarvestDate ? [{ label: "Harvest Date", value: form.expectedHarvestDate }] : []),
                { label: "Expected Yield", value: `${form.expectedYield} ${form.yieldUnit}` },
                ...(form.seedVariety ? [{ label: "Seed Variety", value: form.seedVariety }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false); setStep(1);
                  setForm({ fieldId: "", crop: "", season: "Rabi 2026-27", startDate: "", expectedHarvestDate: "", expectedYield: "", yieldUnit: "Quintal", seedVariety: "", seedQty: "", notes: "" });
                  setCustomCrop("");
                }}
                className="btn-secondary flex-1 justify-center">
                Add Another
              </button>
              <Link href={`/farms/${farmId}/crop-cycles`} className="btn-primary flex-1 justify-center">
                View Crops
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Add Crop Cycle" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/crop-cycles`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Crop Cycles
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {[
            { n: 1, label: "Select Crop" },
            { n: 2, label: "Schedule" },
            { n: 3, label: "Details" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                s.n < step ? "bg-primary-600 text-white" :
                s.n === step ? "bg-primary-600 text-white ring-4 ring-primary-100" :
                "bg-gray-100 text-gray-400"
              }`}>
                {s.n < step ? <CheckCircle2 size={13} /> : s.n}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${s.n === step ? "text-primary-700" : "text-gray-400"}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded mx-1 ${step > s.n ? "bg-primary-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── STEP 1: Field + Crop ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Field selector */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart2 size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Select Field</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {fields.map(f => (
                    <button key={f.id} type="button" onClick={() => set("fieldId", f.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.fieldId === f.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                      }`}>
                      <div className={`text-lg mb-1`}>{f.status === "Active" ? "🌱" : "⬜"}</div>
                      <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                      <p className="text-xs text-gray-400">{f.area} Acre · {f.soil}</p>
                      {f.status === "Active" && f.currentCrop && (
                        <span className="text-xs text-orange-500 font-medium mt-0.5 block">⚠ Has crop</span>
                      )}
                    </button>
                  ))}
                </div>
                {errors.fieldId && <p className="text-red-500 text-xs mt-2">{errors.fieldId}</p>}
              </div>

              {/* Crop selector */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Sprout size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Select Crop</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CROPS.map(c => (
                    <button key={c.name} type="button" onClick={() => set("crop", c.name)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                        form.crop === c.name
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                      }`}>
                      <div className="text-2xl mb-0.5">{c.emoji}</div>
                      <p className="text-xs font-medium text-gray-700 leading-tight">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.season}</p>
                    </button>
                  ))}
                </div>
                {errors.crop && <p className="text-red-500 text-xs mt-2">{errors.crop}</p>}

                {form.crop === "Other" && (
                  <div className="mt-3">
                    <input className="input" placeholder="Enter crop name…"
                      value={customCrop} onChange={e => { setCustomCrop(e.target.value); setErrors(er => { const n = { ...er }; delete n.customCrop; return n; }); }} />
                    {errors.customCrop && <p className="text-red-500 text-xs mt-1">{errors.customCrop}</p>}
                  </div>
                )}
              </div>

              {/* Season */}
              <div className="card p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Season</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map(s => (
                    <button key={s} type="button" onClick={() => set("season", s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                        form.season === s
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 text-gray-500 hover:border-primary-300"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleNext} className="btn-primary w-full justify-center py-2.5">
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: Dates ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CalendarDays size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Schedule</h3>
                </div>

                {/* Selected crop recap */}
                {form.crop && (
                  <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl p-3">
                    <span className="text-2xl">{selectedCrop?.emoji ?? "🌿"}</span>
                    <div>
                      <p className="text-sm font-semibold text-primary-800">{cropName}</p>
                      <p className="text-xs text-primary-500">{selectedField?.name} · {form.season}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sowing / Start Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" className="input" value={form.startDate}
                    onChange={e => set("startDate", e.target.value)} />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Expected Harvest Date
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input type="date" className="input" value={form.expectedHarvestDate}
                    onChange={e => set("expectedHarvestDate", e.target.value)}
                    min={form.startDate} />
                </div>

                {form.startDate && form.expectedHarvestDate && (
                  <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 text-sm text-center">
                    <span className="text-accent-700 font-medium">
                      🗓 Growing period:{" "}
                      {Math.round((new Date(form.expectedHarvestDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
                <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center py-2.5">Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Yield + Seed details ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart2 size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Yield & Seed Info</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Expected Yield <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="number" step="0.1" min="0.1" className="input"
                      placeholder="e.g. 40" value={form.expectedYield}
                      onChange={e => set("expectedYield", e.target.value)} />
                    <select className="input w-36" value={form.yieldUnit}
                      onChange={e => set("yieldUnit", e.target.value)}>
                      <option>Quintal</option>
                      <option>Ton</option>
                      <option>Kg</option>
                      <option>Maund</option>
                    </select>
                  </div>
                  {errors.expectedYield && <p className="text-red-500 text-xs mt-1">{errors.expectedYield}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Seed Variety <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input className="input" placeholder="e.g. HD-2967, PB-1121, K-0307…"
                    value={form.seedVariety} onChange={e => set("seedVariety", e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Seed Quantity Used <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input className="input" placeholder="e.g. 40 kg"
                    value={form.seedQty} onChange={e => set("seedQty", e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                  <textarea rows={3} className="input resize-none"
                    placeholder="Soil preparation, fertilizer plan, observations…"
                    value={form.notes} onChange={e => set("notes", e.target.value)} />
                </div>
              </div>

              {/* Final summary */}
              <div className="card p-4 bg-primary-50 border-primary-100">
                <p className="text-xs font-semibold text-primary-700 mb-3">📋 Crop Cycle Summary</p>
                <div className="space-y-1.5">
                  {[
                    { label: "Crop", value: `${selectedCrop?.emoji ?? "🌿"} ${cropName}` },
                    { label: "Field", value: selectedField?.name ?? "—" },
                    { label: "Season", value: form.season },
                    { label: "Sowing", value: form.startDate || "—" },
                    ...(form.expectedHarvestDate ? [{ label: "Harvest", value: form.expectedHarvestDate }] : []),
                    ...(form.expectedYield ? [{ label: "Yield Target", value: `${form.expectedYield} ${form.yieldUnit}` }] : []),
                    ...(form.seedVariety ? [{ label: "Variety", value: form.seedVariety }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-semibold text-gray-700">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">← Back</button>
                <button type="submit" className="btn-primary flex-1 justify-center py-2.5">
                  🌱 Add Crop Cycle
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
