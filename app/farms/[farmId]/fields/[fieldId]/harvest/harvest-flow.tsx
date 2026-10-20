"use client";
import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ChevronLeft, Plus, Trash2, CheckCircle2, IndianRupee, Wheat, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { harvestAndSellAction, type HarvestAndSellResult } from "@/lib/actions/harvests";
import { cropEmoji } from "@/lib/crops";
import { useTranslations } from "next-intl";
import { fmt, signedFmt } from "@/lib/format";
import { useFormatters } from "@/i18n/client";
import type { CycleStatus, HarvestQuality } from "@/lib/types";
import Spinner from "@/components/Spinner";

type SellRow = { id: string; quantity: string; pricePerUnit: string; buyerType: string; buyerName: string; date: string };
type StockLot = { _id: string; date: string; remaining: number; quality?: HarvestQuality };

// Buyer types; the label is stored on the sale in the language it was recorded in
const BUYERS = ["MANDI", "TRADER", "CONSUMER", "FPO", "MILL", "OTHER"] as const;
const today = () => new Date().toISOString().slice(0, 10);
const newRow = (): SellRow => ({ id: Math.random().toString(36).slice(2), quantity: "", pricePerUnit: "", buyerType: BUYERS[0], buyerName: "", date: today() });
const round = (n: number) => Math.round(n * 1000) / 1000;

export default function HarvestFlow(props: {
  farmId: string;
  fieldId: string;
  cycleId: string;
  mode: "harvest" | "sell";
  status: CycleStatus;
  cropName: string;
  fieldName: string;
  season: string;
  startDate: string;
  unit: string;
  expectedYield: number | null;
  harvestedSoFar: number;
  revenueSoFar: number;
  expenses: { _id: string; date: string; label: string; amount: number }[];
  stock: StockLot[];
}) {
  const { farmId, fieldId, cycleId, mode, cropName, fieldName, expenses } = props;
  const t = useTranslations("harvest");
  const tq = useTranslations("quality");
  const tb = useTranslations("buyers");
  const tc = useTranslations("common");
  const tf = useTranslations("forms");
  const f = useFormatters();
  const u = f.unit(props.unit);
  const buyerOf = (r: SellRow) => {
    const type = tb(r.buyerType as (typeof BUYERS)[number]);
    return r.buyerName.trim() ? `${r.buyerName.trim()} · ${type}` : type;
  };
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);

  const [step, setStep] = useState<"harvest" | "sell" | "confirm">(mode === "harvest" ? "harvest" : "sell");
  const [harvestDate, setHarvestDate] = useState(today());
  const [quantity, setQuantity] = useState(props.expectedYield ? String(props.expectedYield) : "");
  const [quality, setQuality] = useState<HarvestQuality>("A");
  const [notes, setNotes] = useState("");
  const [finalHarvest, setFinalHarvest] = useState(true);
  const [stockId, setStockId] = useState(props.stock[0]?._id ?? "");
  const [sellRows, setSellRows] = useState<SellRow[]>([newRow()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<HarvestAndSellResult | null>(null);

  // How much can be sold in this flow: the new harvest, or the chosen lot of existing stock
  const available = mode === "harvest" ? parseFloat(quantity) || 0 : props.stock.find(s => s._id === stockId)?.remaining ?? 0;
  const lots = sellRows.filter(r => r.quantity || r.pricePerUnit);
  const newRevenue = lots.reduce((a, r) => a + (parseFloat(r.quantity) || 0) * (parseFloat(r.pricePerUnit) || 0), 0);
  const qtySold = round(lots.reduce((a, r) => a + (parseFloat(r.quantity) || 0), 0));
  const totalRevenue = props.revenueSoFar + newRevenue;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const yieldNum = parseFloat(quantity);
  const target = props.expectedYield;

  const addRow = () => setSellRows(r => [...r, newRow()]);
  const removeRow = (id: string) => setSellRows(r => r.filter(x => x.id !== id));
  const updateRow = (id: string, k: keyof SellRow, v: string) => setSellRows(r => r.map(x => (x.id === id ? { ...x, [k]: v } : x)));

  const validateHarvest = () => {
    const e: Record<string, string> = {};
    if (!harvestDate) e.date = t("errors.date");
    if (!quantity || isNaN(yieldNum) || yieldNum <= 0) e.yield = t("errors.quantity");
    return e;
  };

  const validateSell = () => {
    const e: Record<string, string> = {};
    sellRows.forEach((r, i) => {
      if (!r.quantity && !r.pricePerUnit) return; // empty lot is ignored
      if (!r.quantity || isNaN(parseFloat(r.quantity)) || parseFloat(r.quantity) <= 0) e[`qty_${i}`] = t("required");
      if (!r.pricePerUnit || isNaN(parseFloat(r.pricePerUnit)) || parseFloat(r.pricePerUnit) < 0) e[`price_${i}`] = t("required");
      if (!r.date) e[`date_${i}`] = t("required");
    });
    if (mode === "sell" && lots.length === 0) e.lots = t("errors.atLeastOne");
    if (qtySold > available) e.lots = t("errors.overStock", { available, unit: u });
    return e;
  };

  const goToSell = () => {
    const e = validateHarvest();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("sell");
  };

  const goToConfirm = () => {
    const e = validateSell();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await harvestAndSellAction(
      cycleId,
      mode === "harvest"
        ? { harvest: { quantity: yieldNum, quality, date: harvestDate, notes: notes.trim() || undefined, completesCycle: finalHarvest } }
        : { harvestId: stockId },
      lots.map(r => ({ quantity: parseFloat(r.quantity), pricePerUnit: parseFloat(r.pricePerUnit), buyer: buyerOf(r), date: r.date }))
    );
    setSaving(false);
    if (result.error !== undefined) { setErrors({ submit: result.error }); return; }
    setSaved(result.data);
  };

  const steps = mode === "harvest"
    ? [{ key: "harvest", label: t("stepHarvest") }, { key: "sell", label: t("stepSell") }, { key: "confirm", label: t("stepConfirm") }] as const
    : [{ key: "sell", label: t("stepSell") }, { key: "confirm", label: t("stepConfirm") }] as const;
  const stepIndex = steps.findIndex(s => s.key === step);

  if (saved) {
    const soldLots = lots.slice(0, saved.salesSaved);
    const soldQty = round(soldLots.reduce((a, r) => a + parseFloat(r.quantity), 0));
    const savedRevenue = props.revenueSoFar + soldLots.reduce((a, r) => a + parseFloat(r.quantity) * parseFloat(r.pricePerUnit), 0);
    const freed = mode === "harvest" && finalHarvest;
    return (
      <div>
        <TopBar title={mode === "harvest" ? t("titleRecorded") : t("titleSaleRecorded")} />
        <main className="p-4 lg:p-6 max-w-lg mx-auto">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-primary-600" />
            </div>
            <div className="text-4xl mb-2">{cropEmoji(cropName)}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{mode === "harvest" ? t("recorded") : t("saleRecorded")}</h2>
            <p className="text-sm text-gray-500 mb-5">
              {t("fromField", { crop: cropName, field: fieldName })}
              {mode === "harvest" && (freed ? t("fieldFree") : t("staysActive"))}
            </p>
            {saved.error && (
              <p className="bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-lg p-3 mb-4 text-left">
                {t("partialSaved", { error: saved.error, count: saved.salesSaved })}
              </p>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-5">
              {mode === "harvest" && (
                <div className="flex justify-between text-sm"><span className="text-gray-400">{t("harvested")}</span><span className="font-semibold text-gray-700">{t("harvestedValue", { qty: yieldNum, unit: u, grade: tq(`${quality}.label`) })}</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-gray-400">{t("soldNow")}</span><span className="font-semibold text-gray-700">{t("soldNowValue", { qty: soldQty, unit: u, count: saved.salesSaved })}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">{t("unsoldStock")}</span><span className="font-semibold text-gray-700">{round(available - soldQty)} {u}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">{t("totalExpenses")}</span><span className="font-semibold text-red-600">-{fmt(totalExpenses)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">{t("totalRevenue")}</span><span className="font-semibold text-primary-600">+{fmt(savedRevenue)}</span></div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold text-gray-700">{t("netSoFar")}</span>
                <span className={`font-bold text-lg ${savedRevenue - totalExpenses >= 0 ? "text-primary-600" : "text-red-600"}`}>{signedFmt(savedRevenue - totalExpenses)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/farms/${farmId}/crop-cycles/${cycleId}`} className="btn-secondary flex-1 justify-center">{t("viewCrop")}</Link>
              {freed ? (
                <Link href={`/farms/${farmId}/crop-cycles/add?fieldId=${fieldId}`} className="btn-primary flex-1 justify-center">{t("plantNext")}</Link>
              ) : (
                <Link href={`/farms/${farmId}/fields/${fieldId}`} className="btn-primary flex-1 justify-center">{t("backToField")}</Link>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={mode === "harvest" ? t("titleHarvestSell") : t("titleSellStock")} />
      <main className="p-4 lg:p-6 max-w-2xl mx-auto">
        <Link href={`/farms/${farmId}/crop-cycles/${cycleId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> {t("backTo", { crop: cropName })}
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => {
            const past = stepIndex > i;
            const current = step === s.key;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  past ? "bg-primary-600 text-white" : current ? "bg-primary-600 text-white ring-4 ring-primary-100" : "bg-gray-100 text-gray-400"
                }`}>
                  {past ? <CheckCircle2 size={13} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${current ? "text-primary-700" : "text-gray-400"}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${past ? "bg-primary-400" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* Crop context strip */}
        <div className="card p-3 flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-xl">{cropEmoji(cropName)}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{cropName} · {fieldName}</p>
            <p className="text-xs text-gray-400">{t("contextLine", { season: props.season, date: f.date(props.startDate), spend: totalExpenses > 0 ? t("invested", { amount: fmt(totalExpenses) }) : t("noExpenses") })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{props.harvestedSoFar > 0 ? t("harvestedSoFar") : t("targetYield")}</p>
            <p className="text-sm font-bold text-gray-700">
              {props.harvestedSoFar > 0 ? `${props.harvestedSoFar} ${u}` : target ? `${target} ${u}` : "—"}
            </p>
          </div>
        </div>

        {/* ── STEP 1: Harvest details ── */}
        {step === "harvest" && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">{t("recordHarvest")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("harvestDate")} <span className="text-red-500">*</span></label>
                <input type="date" className="input" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("quantityHarvested", { unit: u })} <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" min="0" className="input" placeholder={target ? String(target) : ""}
                  value={quantity} onChange={e => setQuantity(e.target.value)} />
                {errors.yield && <p className="text-red-500 text-xs mt-1">{errors.yield}</p>}
              </div>
            </div>

            {target && !isNaN(yieldNum) && yieldNum > 0 && (
              <div className={`rounded-lg p-3 text-xs flex items-center gap-2 ${yieldNum >= target ? "bg-primary-50 border border-primary-100" : "bg-amber-50 border border-amber-100"}`}>
                {yieldNum >= target ? <CheckCircle2 size={13} className="text-primary-500" /> : <AlertCircle size={13} className="text-amber-500" />}
                <span className={yieldNum >= target ? "text-primary-700" : "text-amber-700"}>
                  {yieldNum >= target ? t("aboveTarget", { qty: round(yieldNum - target), unit: u }) : t("belowTarget", { qty: round(target - yieldNum), unit: u })}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">{t("qualityGrade")}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { g: "A" as const, label: tq("A.label"), desc: tq("A.desc"), color: "border-primary-500 bg-primary-50 text-primary-700" },
                  { g: "B" as const, label: tq("B.label"), desc: tq("B.desc"), color: "border-amber-400 bg-amber-50 text-amber-700" },
                  { g: "C" as const, label: tq("C.label"), desc: tq("C.desc"), color: "border-gray-400 bg-gray-50 text-gray-700" },
                ].map(q => (
                  <button key={q.g} type="button" onClick={() => setQuality(q.g)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${quality === q.g ? q.color : "border-gray-100 hover:border-gray-200"}`}>
                    <p className="text-sm font-bold">{q.label}</p>
                    <p className="text-xs text-gray-400">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={finalHarvest} onChange={e => setFinalHarvest(e.target.checked)} />
              <span className="text-xs text-gray-600">
                {t.rich("finalHarvest", { field: fieldName, b: chunks => <b>{chunks}</b> })}
                <span className="block text-gray-400">{t("finalHarvestHint")}</span>
              </span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("notes")}</label>
              <textarea rows={2} className="input resize-none" placeholder={t("notesPlaceholder")} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button onClick={goToSell} className="btn-primary w-full justify-center py-2.5">{t("nextSales")}</button>
          </div>
        )}

        {/* ── STEP 2: Sell lots ── */}
        {step === "sell" && (
          <div className="space-y-4">
            {mode === "sell" && (
              props.stock.length === 0 ? (
                <div className="card p-6 text-center text-sm text-gray-500">
                  {t("noStock")}
                  {props.status === "ACTIVE" && (
                    <Link href={`/farms/${farmId}/fields/${fieldId}/harvest?cycleId=${cycleId}`} className="block mt-3 text-primary-600 underline">{t("recordFirst")}</Link>
                  )}
                </div>
              ) : props.stock.length > 1 && (
                <div className="card p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">{t("sellFrom")}</p>
                  <div className="flex flex-wrap gap-2">
                    {props.stock.map(s => (
                      <button key={s._id} type="button" onClick={() => setStockId(s._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 ${stockId === s._id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600"}`}>
                        {t("stockLot", { date: f.date(s.date), qty: s.remaining, unit: u })}{s.quality && ` · ${tq(`${s.quality}.label`)}`}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {(mode === "harvest" || props.stock.length > 0) && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{t("sellLots")}</h3>
                    <p className="text-xs text-gray-400">
                      {t("sellLotsHint", { left: round(available - qtySold), available, unit: u })}
                    </p>
                  </div>
                  <button onClick={addRow} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Plus size={12} /> {t("addLot")}</button>
                </div>

                <div className="space-y-4">
                  {sellRows.map((row, i) => (
                    <div key={row.id} className="bg-gray-50 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">{t("lot", { n: i + 1 })}</p>
                        {sellRows.length > 1 && (
                          <button onClick={() => removeRow(row.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t("quantity", { unit: u })} <span className="text-red-500">*</span></label>
                          <input type="number" step="0.01" min="0" className="input" placeholder={t("quantityPlaceholder")} value={row.quantity}
                            onChange={e => updateRow(row.id, "quantity", e.target.value)} />
                          {errors[`qty_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`qty_${i}`]}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t("rate", { unit: u })} <span className="text-red-500">*</span></label>
                          <input type="number" min="0" step="0.01" className="input" placeholder={t("ratePlaceholder")} value={row.pricePerUnit}
                            onChange={e => updateRow(row.id, "pricePerUnit", e.target.value)} />
                          {errors[`price_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`price_${i}`]}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t("buyerType")}</label>
                          <select className="input" value={row.buyerType} onChange={e => updateRow(row.id, "buyerType", e.target.value)}>
                            {BUYERS.map(b => <option key={b} value={b}>{tb(b)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t("buyerName")}</label>
                          <input className="input" placeholder={t("optional")} value={row.buyerName} onChange={e => updateRow(row.id, "buyerName", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t("saleDate")} <span className="text-red-500">*</span></label>
                          <input type="date" className="input" value={row.date} onChange={e => updateRow(row.id, "date", e.target.value)} />
                          {errors[`date_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`date_${i}`]}</p>}
                        </div>
                      </div>
                      {row.quantity && row.pricePerUnit && (
                        <div className="flex justify-between text-xs font-semibold bg-primary-50 rounded-lg p-2">
                          <span className="text-gray-500">{t("lotTotal", { n: i + 1 })}</span>
                          <span className="text-primary-600">+{fmt((parseFloat(row.quantity) || 0) * (parseFloat(row.pricePerUnit) || 0))}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors.lots && <p className="text-red-500 text-xs mt-3">{errors.lots}</p>}
                {newRevenue > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <span className="text-sm font-semibold text-gray-600">{t("revenueFrom", { count: lots.length })}</span>
                    <span className="text-base font-bold text-primary-600">+{fmt(newRevenue)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {mode === "harvest" && <button onClick={() => setStep("harvest")} className="btn-secondary flex-1 justify-center">{tf("back")}</button>}
              {(mode === "harvest" || props.stock.length > 0) && (
                <button onClick={goToConfirm} className="btn-primary flex-1 justify-center py-2.5">
                  {mode === "harvest" && lots.length === 0 ? t("skip") : t("review")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm P&L ── */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">{t("pnlFor", { crop: cropName })}</h3>
              <div className={`rounded-2xl p-5 text-center mb-5 ${netProfit >= 0 ? "bg-primary-50 border border-primary-200" : "bg-red-50 border border-red-200"}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">{t("netAfterSaving")}</p>
                <p className={`text-4xl font-bold ${netProfit >= 0 ? "text-primary-600" : "text-red-600"}`}>{signedFmt(netProfit)}</p>
                {totalRevenue > 0 && <p className="text-sm text-gray-400 mt-1">{t("margin", { pct: profitMargin })}</p>}
              </div>

              <div className="space-y-2 mb-4">
                {mode === "harvest" && (
                  <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1.5"><Wheat size={13} /> {t("thisHarvest")}</span>
                    <span className="font-semibold text-gray-700">{t("thisHarvestValue", { qty: yieldNum, unit: u, grade: tq(`${quality}.label`) })}{finalHarvest ? t("final") : ""}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5"><IndianRupee size={13} /> {t("sellingNow")}</span>
                  <span className="font-semibold text-gray-700">{t("sellingNowValue", { qty: qtySold, unit: u, count: lots.length, kept: round(available - qtySold) })}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-red-500 flex items-center gap-1.5"><TrendingDown size={13} /> {t("totalExpenses")}</span>
                  <span className="font-bold text-red-600">-{fmt(totalExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-primary-600 flex items-center gap-1.5"><TrendingUp size={13} /> {t("totalRevenue")}{props.revenueSoFar > 0 && t("revenueEarlier", { amount: fmt(props.revenueSoFar) })}</span>
                  <span className="font-bold text-primary-600">+{fmt(totalRevenue)}</span>
                </div>
              </div>

              {expenses.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t("expensesDetail", { count: expenses.length })}</p>
                  <div className="space-y-1">
                    {expenses.map(e => (
                      <div key={e._id} className="flex justify-between text-xs">
                        <span className="text-gray-500">{f.date(e.date)} · {e.label}</span>
                        <span className="text-red-500">-{fmt(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lots.length > 0 && (
                <div className="bg-primary-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-primary-700 mb-2">{t("saleTransactions", { count: lots.length })}</p>
                  <div className="space-y-1">
                    {lots.map((r, i) => (
                      <div key={r.id} className="flex justify-between text-xs">
                        <span className="text-gray-500">{t("lotLine", { n: i + 1, date: f.date(r.date), qty: r.quantity, unit: u, rate: fmt(parseFloat(r.pricePerUnit || "0")), buyer: buyerOf(r) })}</span>
                        <span className="font-semibold text-primary-600">+{fmt((parseFloat(r.quantity) || 0) * (parseFloat(r.pricePerUnit) || 0))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.submit && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.submit}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep("sell")} disabled={saving} className="btn-secondary flex-1 justify-center">{t("editLots")}</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving && <Spinner />}{saving ? tc("saving") : mode === "harvest" ? (finalHarvest ? t("saveClose") : t("saveHarvest")) : t("saveSales")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
