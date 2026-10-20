"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { ChevronLeft, MapPin, Layers, CheckCircle2 } from "lucide-react";
import { createFieldAction } from "@/lib/actions/farms";
import { useTranslations } from "next-intl";
import { AREA_UNITS, IRRIGATION_TYPES, SOIL_TYPES } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { AreaUnit } from "@/lib/types";
import Spinner from "@/components/Spinner";

const EMPTY_FORM = { name: "", area: "", areaUnit: "ACRE" as AreaUnit, soil: "", irrigation: "", notes: "" };

export default function AddFieldPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const t = useTranslations("addField");
  const tf = useTranslations("forms");
  const tc = useTranslations("common");
  const f = useFormatters();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = tf("errors.fieldNameRequired");
    if (!form.area || isNaN(Number(form.area)) || Number(form.area) <= 0)
      e.area = tf("errors.validFieldArea");
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.soil) e.soil = tf("errors.soilType");
    if (!form.irrigation) e.irrigation = tf("errors.irrigationSourceType");
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const result = await createFieldAction(farmId, {
      name: form.name.trim(),
      area: Number(form.area),
      areaUnit: form.areaUnit,
      soilType: form.soil,
      irrigationType: form.irrigation,
      notes: form.notes.trim() || undefined,
    });
    setSaving(false);
    if (result.error !== undefined) { setErrors({ form: result.error }); return; }
    setSubmitted(true);
  };

  const unitLabel = f.areaUnit(form.areaUnit, true);

  if (submitted) {
    return (
      <div>
        <TopBar title={t("title")} />
        <main className="p-4 lg:p-6 max-w-lg mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{t("added")}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {t.rich("addedText", { name: form.name, b: chunks => <span className="font-semibold text-primary-700">{chunks}</span> })}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 mt-4">
              {[
                { label: t("area"), value: `${form.area} ${unitLabel}` },
                { label: t("soilType"), value: f.soil(form.soil) },
                { label: t("irrigation"), value: f.irrigation(form.irrigation) },
                ...(form.notes ? [{ label: t("notes"), value: form.notes }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSubmitted(false); setStep(1); setForm(EMPTY_FORM); }}
                className="btn-secondary flex-1 justify-center">
                {t("addAnother")}
              </button>
              <Link href={`/farms/${farmId}/fields`} className="btn-primary flex-1 justify-center">
                {t("viewFields")}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        {/* Back */}
        <Link href={`/farms/${farmId}/fields`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> {t("backToFields")}
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
                {s === 1 ? t("stepBasic") : t("stepSoil")}
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
                <h3 className="font-semibold text-gray-800">{t("details")}</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t("fieldName")} <span className="text-red-500">*</span>
                </label>
                <input
                  className="input"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t("area")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input"
                    placeholder={t("areaPlaceholder")}
                    value={form.area}
                    onChange={e => set("area", e.target.value)}
                  />
                  <select
                    className="input w-32"
                    value={form.areaUnit}
                    onChange={e => set("areaUnit", e.target.value)}
                  >
                    {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{f.areaUnit(u.value, true)}</option>)}
                  </select>
                </div>
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("notesOptional")}</label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder={t("notesPlaceholder")}
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                />
              </div>

              <button type="button" onClick={handleNext} className="btn-primary w-full justify-center py-2.5">
                {tf("continue")}
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
                <h3 className="font-semibold text-gray-800">{t("soilAndIrrigation")}</h3>
              </div>

              {/* Soil type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  {t("soilType")} <span className="text-red-500">*</span>
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
                      {f.soil(s)}
                    </button>
                  ))}
                </div>
                {errors.soil && <p className="text-red-500 text-xs mt-1">{errors.soil}</p>}
              </div>

              {/* Irrigation */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  {t("irrigationSource")} <span className="text-red-500">*</span>
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
                      {f.irrigation(ir)}
                    </button>
                  ))}
                </div>
                {errors.irrigation && <p className="text-red-500 text-xs mt-1">{errors.irrigation}</p>}
              </div>

              {/* Summary preview */}
              {(form.soil || form.irrigation) && (
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-accent-700 mb-2">{t("summary")}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{t("name")}</span>
                      <span className="font-semibold text-gray-700">{form.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{t("area")}</span>
                      <span className="font-semibold text-gray-700">{form.area} {unitLabel}</span>
                    </div>
                    {form.soil && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{t("soil")}</span>
                        <span className="font-semibold text-gray-700">{f.soil(form.soil)}</span>
                      </div>
                    )}
                    {form.irrigation && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{t("irrigation")}</span>
                        <span className="font-semibold text-gray-700">{f.irrigation(form.irrigation)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  {tf("back")}
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                  {saving && <Spinner />}{saving ? tc("saving") : t("submit")}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
