"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { ChevronLeft, Sprout, CalendarDays, BarChart2, CheckCircle2 } from "lucide-react";
import { createCycleAction } from "@/lib/actions/cycles";
import { COMMON_CROPS, cropEmoji } from "@/lib/crops";
import { useTranslations } from "next-intl";
import { YIELD_UNITS } from "@/lib/format";
import { SEASON_TYPES, currentSeasonType, getSeasonYear } from "@/lib/season";
import { useFormatters } from "@/i18n/client";
import type { AreaUnit, SeasonType } from "@/lib/types";
import Spinner from "@/components/Spinner";

type FieldOption = { _id: string; name: string; area: number; areaUnit: AreaUnit; soilType?: string; activeCrop: string | null };

const OTHER = "__other__";

export default function AddCycleForm({ farmId, fields, userCrops, initialFieldId }: {
  farmId: string;
  fields: FieldOption[];
  userCrops: string[];
  initialFieldId: string;
}) {
  const router = useRouter();
  const t = useTranslations("addCycle");
  const tf = useTranslations("forms");
  const tc = useTranslations("common");
  const fm = useFormatters();
  const tMonths = useTranslations("seasonMonths");
  // The user's own crops first, then common suggestions they haven't used yet
  const cropOptions = [
    ...userCrops.map(name => ({ name, emoji: cropEmoji(name), season: COMMON_CROPS.find(c => c.name.toLowerCase() === name.toLowerCase())?.season })),
    ...COMMON_CROPS.filter(c => !userCrops.some(u => u.toLowerCase() === c.name.toLowerCase())),
  ];

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [customCrop, setCustomCrop] = useState("");
  const [form, setForm] = useState({
    fieldId: fields.some(f => f._id === initialFieldId) ? initialFieldId : "",
    crop: "",
    seasonType: currentSeasonType() as SeasonType,
    startDate: "",
    expectedHarvestDate: "",
    expectedYield: "",
    yieldUnit: "QTL",
    variety: "",
    seedQty: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; delete n.form; return n; });
  };

  const pickCrop = (name: string, season?: SeasonType) => {
    set("crop", name);
    if (season) set("seasonType", season);
  };

  const selectedField = fields.find(f => f._id === form.fieldId);
  const cropName = form.crop === OTHER ? customCrop.trim() : form.crop;
  // A field can only have one growing crop; a second one is saved as planned
  const status = selectedField?.activeCrop ? "PLANNED" : "ACTIVE";
  const season = form.startDate ? fm.season(form.seasonType, getSeasonYear(form.seasonType, form.startDate)) : fm.seasonType(form.seasonType);
  const yieldUnitLabel = fm.unit(form.yieldUnit, true);
  // Built-in crops show in the user's language; custom names as typed
  const cropLabel = form.crop === OTHER ? cropName : fm.crop(cropName);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fieldId) e.fieldId = t("errors.field");
    if (!form.crop) e.crop = t("errors.crop");
    if (form.crop === OTHER && !customCrop.trim()) e.customCrop = t("errors.customCrop");
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = t("errors.startDate");
    if (form.expectedHarvestDate && form.startDate && form.expectedHarvestDate < form.startDate)
      e.expectedHarvestDate = t("errors.harvestAfter");
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.expectedYield && (isNaN(Number(form.expectedYield)) || Number(form.expectedYield) <= 0))
      e.expectedYield = t("errors.yield");
    return e;
  };

  const handleNext = () => {
    const e = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep3();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const seedNote = form.seedQty.trim() ? t("seedUsedNote", { qty: form.seedQty.trim() }) : "";
    const result = await createCycleAction({
      fieldId: form.fieldId,
      cropName,
      seasonType: form.seasonType,
      startDate: form.startDate,
      expectedHarvestDate: form.expectedHarvestDate || undefined,
      expectedYield: form.expectedYield ? Number(form.expectedYield) : undefined,
      yieldUnit: form.yieldUnit,
      variety: form.variety.trim() || undefined,
      notes: [seedNote, form.notes.trim()].filter(Boolean).join("\n") || undefined,
      status,
    });
    if (result.error !== undefined) {
      setSaving(false);
      setErrors({ form: result.error });
      return;
    }
    router.push(`/farms/${farmId}/crop-cycles/${result.data.cycleId}`);
  };

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={`/farms/${farmId}/crop-cycles`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> {t("backToCycles")}
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {[
            { n: 1, label: t("stepCrop") },
            { n: 2, label: t("stepSchedule") },
            { n: 3, label: t("stepDetails") },
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
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart2 size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{t("selectField")}</h3>
                </div>
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {t.rich("noFields", { link: chunks => <Link href={`/farms/${farmId}/fields/add`} className="text-primary-600 underline">{chunks}</Link> })}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map(f => (
                      <button key={f._id} type="button" onClick={() => set("fieldId", f._id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          form.fieldId === f._id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                        }`}>
                        <div className="text-lg mb-1">{f.activeCrop ? "🌱" : "⬜"}</div>
                        <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                        <p className="text-xs text-gray-400">{[fm.area(f.area, f.areaUnit), fm.soil(f.soilType)].filter(Boolean).join(" · ")}</p>
                        {f.activeCrop && (
                          <span className="text-xs text-orange-500 font-medium mt-0.5 block">{t("growing", { crop: fm.crop(f.activeCrop) })}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {errors.fieldId && <p className="text-red-500 text-xs mt-2">{errors.fieldId}</p>}
                {selectedField?.activeCrop && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mt-3">
                    {t.rich("busyField", { field: selectedField.name, crop: fm.crop(selectedField.activeCrop), b: chunks => <b>{chunks}</b> })}
                  </p>
                )}
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Sprout size={15} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{t("selectCrop")}</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {cropOptions.map(c => (
                    <button key={c.name} type="button" onClick={() => pickCrop(c.name, c.season)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                        form.crop === c.name
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                      }`}>
                      <div className="text-2xl mb-0.5">{c.emoji}</div>
                      <p className="text-xs font-medium text-gray-700 leading-tight">{fm.crop(c.name)}</p>
                      {c.season && <p className="text-xs text-gray-400">{fm.seasonType(c.season)}</p>}
                    </button>
                  ))}
                  <button type="button" onClick={() => set("crop", OTHER)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      form.crop === OTHER ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-primary-200 hover:bg-primary-50/30"
                    }`}>
                    <div className="text-2xl mb-0.5">🌿</div>
                    <p className="text-xs font-medium text-gray-700 leading-tight">{t("other")}</p>
                    <p className="text-xs text-gray-400">{t("any")}</p>
                  </button>
                </div>
                {errors.crop && <p className="text-red-500 text-xs mt-2">{errors.crop}</p>}

                {form.crop === OTHER && (
                  <div className="mt-3">
                    <input className="input" placeholder={t("cropNamePlaceholder")}
                      value={customCrop} onChange={e => { setCustomCrop(e.target.value); setErrors(er => { const n = { ...er }; delete n.customCrop; return n; }); }} />
                    {errors.customCrop && <p className="text-red-500 text-xs mt-1">{errors.customCrop}</p>}
                  </div>
                )}
              </div>

              <div className="card p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">{t("season")}</label>
                <div className="flex flex-wrap gap-2">
                  {SEASON_TYPES.map(s => (
                    <button key={s.value} type="button" onClick={() => set("seasonType", s.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                        form.seasonType === s.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 text-gray-500 hover:border-primary-300"
                      }`}>
                      {fm.seasonType(s.value)} <span className="text-gray-400 font-normal">· {tMonths(s.value)}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{t("seasonHint")}</p>
              </div>

              <button type="button" onClick={handleNext} disabled={fields.length === 0} className="btn-primary w-full justify-center py-2.5">
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
                  <h3 className="font-semibold text-gray-800">{t("schedule")}</h3>
                </div>

                <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl p-3">
                  <span className="text-2xl">{cropEmoji(cropName)}</span>
                  <div>
                    <p className="text-sm font-semibold text-primary-800">{cropLabel}</p>
                    <p className="text-xs text-primary-500">{selectedField?.name} · {season}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("startDate")} <span className="text-red-500">*</span>
                  </label>
                  <input type="date" className="input" value={form.startDate}
                    onChange={e => set("startDate", e.target.value)} />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("harvestDate")}
                    <span className="text-gray-400 font-normal ml-1">{t("optional")}</span>
                  </label>
                  <input type="date" className="input" value={form.expectedHarvestDate}
                    onChange={e => set("expectedHarvestDate", e.target.value)}
                    min={form.startDate} />
                  {errors.expectedHarvestDate && <p className="text-red-500 text-xs mt-1">{errors.expectedHarvestDate}</p>}
                </div>

                {form.startDate && form.expectedHarvestDate && form.expectedHarvestDate >= form.startDate && (
                  <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 text-sm text-center">
                    <span className="text-accent-700 font-medium">
                      {t("growingPeriod", { days: Math.round((new Date(form.expectedHarvestDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">{tf("back")}</button>
                <button type="button" onClick={handleNext} className="btn-primary flex-1 justify-center py-2.5">{tf("continue")}</button>
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
                  <h3 className="font-semibold text-gray-800">{t("yieldAndSeed")}</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("expectedYield")} <span className="text-gray-400 font-normal">{t("optional")}</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="number" step="0.1" min="0.1" className="input"
                      placeholder={t("yieldPlaceholder")} value={form.expectedYield}
                      onChange={e => set("expectedYield", e.target.value)} />
                    <select className="input w-36" value={form.yieldUnit}
                      onChange={e => set("yieldUnit", e.target.value)}>
                      {YIELD_UNITS.map(u => <option key={u.value} value={u.value}>{fm.unit(u.value, true)}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t("unitHint")}</p>
                  {errors.expectedYield && <p className="text-red-500 text-xs mt-1">{errors.expectedYield}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("variety")} <span className="text-gray-400 font-normal">{t("optional")}</span>
                  </label>
                  <input className="input" placeholder={t("varietyPlaceholder")}
                    value={form.variety} onChange={e => set("variety", e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {t("seedQty")} <span className="text-gray-400 font-normal">{t("optional")}</span>
                  </label>
                  <input className="input" placeholder={t("seedQtyPlaceholder")}
                    value={form.seedQty} onChange={e => set("seedQty", e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tf("notes")}</label>
                  <textarea rows={3} className="input resize-none"
                    placeholder={t("notesPlaceholder")}
                    value={form.notes} onChange={e => set("notes", e.target.value)} />
                </div>
              </div>

              <div className="card p-4 bg-primary-50 border-primary-100">
                <p className="text-xs font-semibold text-primary-700 mb-3">{t("summary")}</p>
                <div className="space-y-1.5">
                  {[
                    { label: t("summaryCrop"), value: `${cropEmoji(cropName)} ${cropLabel}` },
                    { label: t("summaryField"), value: selectedField?.name ?? "—" },
                    { label: t("summarySeason"), value: season },
                    { label: t("summarySowing"), value: fm.date(form.startDate) || "—" },
                    ...(form.expectedHarvestDate ? [{ label: t("summaryHarvest"), value: fm.date(form.expectedHarvestDate) }] : []),
                    ...(form.expectedYield ? [{ label: t("summaryYield"), value: `${form.expectedYield} ${yieldUnitLabel}` }] : []),
                    ...(form.variety ? [{ label: t("summaryVariety"), value: form.variety }] : []),
                    { label: t("summaryStatus"), value: fm.status(status) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-semibold text-gray-700">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {errors.form && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.form}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">{tf("back")}</button>
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
