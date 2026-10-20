"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ChevronRight, CheckCircle2 } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions/farms";
import { useTranslations } from "next-intl";
import { AREA_UNITS, IRRIGATION_TYPES, SOIL_TYPES } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { AreaUnit } from "@/lib/types";
import Spinner from "@/components/Spinner";


export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tf = useTranslations("forms");
  const tc = useTranslations("common");
  const f = useFormatters();
  const steps = [t("steps.farm"), t("steps.field")];
  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState({ name: "", district: "", state: "", totalArea: "", areaUnit: "ACRE" as AreaUnit });
  const [field, setField] = useState({ name: t("defaultFieldName"), area: "", soil: "", irrigation: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [farmId, setFarmId] = useState("");

  const setF = (k: string, v: string) => { setFarm(p => ({ ...p, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };
  const setFl = (k: string, v: string) => { setField(p => ({ ...p, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!farm.name.trim()) e.fname = tf("errors.farmNameRequired");
    if (!farm.district.trim()) e.location = tf("errors.districtRequired");
    if (!farm.totalArea || isNaN(Number(farm.totalArea)) || Number(farm.totalArea) <= 0) e.area = tf("errors.totalArea");
    return e;
  };
  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!field.area || isNaN(Number(field.area)) || Number(field.area) <= 0) e.farea = tf("errors.fieldArea");
    if (!field.soil) e.soil = tf("errors.soil");
    if (!field.irrigation) e.irr = tf("errors.irrigation");
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
        name: field.name.trim() || t("defaultFieldName"),
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

  const unitLabel = f.areaUnit(farm.areaUnit, true);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-primary-800">{tc("appName")}</span>
        </div>

        {/* Progress bar */}
        {step > 0 && step < 3 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              {steps.map((s, i) => (
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
              <h1 className="text-2xl font-bold text-gray-800">{t("welcomeTitle")}</h1>
              <p className="text-gray-500 text-sm mt-2">{t("welcomeText")}</p>
            </div>
            <div className="text-left space-y-3">
              {[
                { icon: "🏡", text: t("point1") },
                { icon: "🗺️", text: t("point2") },
                { icon: "🌱", text: t("point3") },
              ].map(i => (
                <div key={i.text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{i.icon}</span> {i.text}
                </div>
              ))}
            </div>
            <button onClick={next} className="btn-primary w-full justify-center py-3 text-base">
              {t("getStarted")} <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        )}

        {/* STEP 1: Farm details */}
        {step === 1 && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{t("farmTitle")}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t("farmSubtitle")}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("farmName")} <span className="text-red-500">*</span></label>
              <input className="input" placeholder={tf("farmNamePlaceholder")} value={farm.name} onChange={e => setF("name", e.target.value)} />
              {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("district")} <span className="text-red-500">*</span></label>
                <input className="input" placeholder={tf("districtPlaceholder")} value={farm.district} onChange={e => setF("district", e.target.value)} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("state")}</label>
                <input className="input" placeholder={tf("statePlaceholder")} value={farm.state} onChange={e => setF("state", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("totalArea")} <span className="text-red-500">*</span></label>
              <div className="flex gap-1.5">
                <input type="number" step="0.01" min="0.01" className="input" placeholder="e.g. 4" value={farm.totalArea} onChange={e => setF("totalArea", e.target.value)} />
                <select className="input w-32" value={farm.areaUnit} onChange={e => setF("areaUnit", e.target.value)}>
                  {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{f.areaUnit(u.value, true)}</option>)}
                </select>
              </div>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(0)} className="btn-secondary px-4">{tf("back")}</button>
              <button onClick={next} className="btn-primary flex-1 justify-center py-2.5">{tf("continue")}</button>
            </div>
          </div>
        )}

        {/* STEP 2: First field */}
        {step === 2 && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{t("fieldTitle")}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t.rich("fieldSubtitle", { farm: farm.name, b: chunks => <span className="font-semibold text-primary-600">{chunks}</span> })}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("fieldName")}</label>
                <input className="input" value={field.name} onChange={e => setFl("name", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("areaWithUnit", { unit: unitLabel })} <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" min="0.01" className="input" placeholder="e.g. 1.5" value={field.area} onChange={e => setFl("area", e.target.value)} />
                {errors.farea && <p className="text-red-500 text-xs mt-1">{errors.farea}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">{tf("soilType")} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {SOIL_TYPES.map(s => (
                  <button key={s} type="button" onClick={() => setFl("soil", s)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${field.soil === s ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>
                    {f.soil(s)}
                  </button>
                ))}
              </div>
              {errors.soil && <p className="text-red-500 text-xs mt-1">{errors.soil}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">{tf("irrigation")} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {IRRIGATION_TYPES.map(ir => (
                  <button key={ir} type="button" onClick={() => setFl("irrigation", ir)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${field.irrigation === ir ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-500 hover:border-primary-200"}`}>
                    {f.irrigation(ir)}
                  </button>
                ))}
              </div>
              {errors.irr && <p className="text-red-500 text-xs mt-1">{errors.irr}</p>}
            </div>
            {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(1)} className="btn-secondary px-4">{tf("back")}</button>
              <button onClick={complete} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving && <Spinner />}{saving ? t("settingUp") : t("complete")}
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
              <h2 className="text-2xl font-bold text-gray-800">{t("allSet")}</h2>
              <p className="text-gray-500 text-sm mt-2">
                {t.rich("ready", { farm: farm.name, field: field.name, b: chunks => <span className="font-semibold text-primary-700">{chunks}</span> })}
              </p>
            </div>
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-left space-y-2">
              {[
                { label: t("summaryFarm"), value: farm.name },
                { label: t("summaryLocation"), value: [farm.district, farm.state].filter(Boolean).join(", ") },
                { label: t("summaryArea"), value: f.area(Number(farm.totalArea), farm.areaUnit, true) },
                { label: t("summaryField"), value: `${field.name} · ${f.area(Number(field.area), farm.areaUnit)} · ${f.soil(field.soil)}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="font-semibold text-gray-700">{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push(`/farms/${farmId}`)} className="btn-primary w-full justify-center py-3 text-base">
              {t("goToFarm")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
