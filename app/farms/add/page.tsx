"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft } from "lucide-react";
import { createFarmAction } from "@/lib/actions/farms";
import { useTranslations } from "next-intl";
import { AREA_UNITS, IRRIGATION_TYPES, SOIL_TYPES } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { AreaUnit } from "@/lib/types";
import Spinner from "@/components/Spinner";

const EMPTY_FORM = { name: "", village: "", district: "", state: "", totalArea: "", areaUnit: "ACRE" as AreaUnit, soilType: "", irrigation: "" };

export default function AddFarmPage() {
  const router = useRouter();
  const t = useTranslations("farms");
  const tf = useTranslations("forms");
  const f = useFormatters();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; }); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = tf("errors.farmNameRequired");
    if (!form.district.trim()) e.district = tf("errors.districtRequired");
    if (!form.totalArea || isNaN(Number(form.totalArea)) || Number(form.totalArea) <= 0) e.totalArea = tf("errors.validArea");
    if (!form.soilType) e.soilType = tf("errors.soil");
    if (!form.irrigation) e.irrigation = tf("errors.irrigationSource");
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const result = await createFarmAction({
      name: form.name.trim(),
      location: { village: form.village.trim(), district: form.district.trim(), state: form.state.trim() },
      totalArea: Number(form.totalArea),
      areaUnit: form.areaUnit,
      soilType: form.soilType,
      irrigationType: form.irrigation,
    });
    if (result.error !== undefined) {
      setSaving(false);
      setErrors({ form: result.error });
      return;
    }
    router.push(`/farms/${result.data.farmId}`);
  };

  return (
    <div><TopBar title={t("addFarm")} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href="/farms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> {t("backToFarms")}
        </Link>
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{t("newFarm")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("newFarmSubtitle")}</p>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("farmName")} <span className="text-red-500">*</span></label>
            <input className="input" placeholder={t("namePlaceholder")} value={form.name} onChange={e => set("name", e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("village")}</label>
              <input className="input" value={form.village} onChange={e => set("village", e.target.value)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("district")} <span className="text-red-500">*</span></label>
              <input className="input" value={form.district} onChange={e => set("district", e.target.value)} />
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("state")}</label>
              <input className="input" value={form.state} onChange={e => set("state", e.target.value)} />
            </div>
          </div>
          {errors.district && <p className="text-red-500 text-xs -mt-3">{errors.district}</p>}
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("totalArea")} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="number" step="0.01" min="0.01" className="input" placeholder="4" value={form.totalArea} onChange={e => set("totalArea", e.target.value)} />
              <select className="input w-32" value={form.areaUnit} onChange={e => set("areaUnit", e.target.value)}>
                {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{f.areaUnit(u.value, true)}</option>)}
              </select>
            </div>
            {errors.totalArea && <p className="text-red-500 text-xs mt-1">{errors.totalArea}</p>}
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-2">{tf("soilType")} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {SOIL_TYPES.map(s => (
                <button key={s} type="button" onClick={() => set("soilType", s)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.soilType === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>{f.soil(s)}</button>
              ))}
            </div>
            {errors.soilType && <p className="text-red-500 text-xs mt-1">{errors.soilType}</p>}
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-2">{tf("primaryIrrigation")} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {IRRIGATION_TYPES.map(ir => (
                <button key={ir} type="button" onClick={() => set("irrigation", ir)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.irrigation === ir ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>{f.irrigation(ir)}</button>
              ))}
            </div>
            {errors.irrigation && <p className="text-red-500 text-xs mt-1">{errors.irrigation}</p>}
          </div>
          {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-2.5">
            {saving && <Spinner />}{saving ? t("creating") : t("create")}
          </button>
        </form>
      </main>
    </div>
  );
}
