"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Silty", "Black Cotton", "Red Laterite"];
const IRRIGATION_TYPES = ["Tube Well", "Canal", "Drip", "Sprinkler", "Borewell", "River Lift", "Rainwater"];
const SEASONS = ["Rabi 2026-27", "Kharif 2026", "Zaid 2026", "Rabi 2027-28"];

export default function AddFarmPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", totalArea: "", soilType: "", irrigation: "", season: "Rabi 2026-27" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Farm name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.totalArea || isNaN(Number(form.totalArea))) e.totalArea = "Enter valid area";
    if (!form.soilType) e.soilType = "Select soil type";
    if (!form.irrigation) e.irrigation = "Select irrigation source";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div><TopBar title="Add Farm" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-primary-600" />
          </div>
          <div className="text-4xl mb-2">🌾</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Farm Created!</h2>
          <p className="text-sm text-gray-500 mb-5"><span className="font-semibold text-primary-700">{form.name}</span> has been added.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {[{ l: "Name", v: form.name }, { l: "Location", v: form.location }, { l: "Area", v: `${form.totalArea} Acres` }, { l: "Soil", v: form.soilType }, { l: "Irrigation", v: form.irrigation }, { l: "Season", v: form.season }].map(r => (
              <div key={r.l} className="flex justify-between text-sm"><span className="text-gray-400">{r.l}</span><span className="font-medium text-gray-700">{r.v}</span></div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm({ name: "", location: "", totalArea: "", soilType: "", irrigation: "", season: "Rabi 2026-27" }); }} className="btn-secondary flex-1 justify-center">Add Another</button>
            <Link href="/farms" className="btn-primary flex-1 justify-center">View Farms</Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div><TopBar title="Add Farm" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href="/farms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> Back to Farms
        </Link>
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">New Farm</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details for your new farm</p>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Farm name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. South Farm, Khet No. 2…" value={form.name} onChange={e => set("name", e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Location <span className="text-red-500">*</span></label>
            <input className="input" placeholder="Village, District, State" value={form.location} onChange={e => set("location", e.target.value)} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Area <span className="text-red-500">*</span></label>
              <div className="flex gap-1.5">
                <input type="number" className="input" placeholder="4" value={form.totalArea} onChange={e => set("totalArea", e.target.value)} />
                <span className="input w-16 text-center bg-gray-50 text-gray-500">Ac</span>
              </div>
              {errors.totalArea && <p className="text-red-500 text-xs mt-1">{errors.totalArea}</p>}
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Season</label>
              <select className="input" value={form.season} onChange={e => set("season", e.target.value)}>
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-2">Soil type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {SOIL_TYPES.map(s => (
                <button key={s} type="button" onClick={() => set("soilType", s)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.soilType === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>{s}</button>
              ))}
            </div>
            {errors.soilType && <p className="text-red-500 text-xs mt-1">{errors.soilType}</p>}
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-2">Primary irrigation <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {IRRIGATION_TYPES.map(ir => (
                <button key={ir} type="button" onClick={() => set("irrigation", ir)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.irrigation === ir ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>{ir}</button>
              ))}
            </div>
            {errors.irrigation && <p className="text-red-500 text-xs mt-1">{errors.irrigation}</p>}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5">Create Farm ✓</button>
        </form>
      </main>
    </div>
  );
}
