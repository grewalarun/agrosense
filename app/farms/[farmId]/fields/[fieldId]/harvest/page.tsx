"use client";
import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { FARMS, CROP_CYCLES, getCycleExpenses, getCyclePL, fmt } from "@/lib/data";
import { ChevronLeft, Plus, Trash2, CheckCircle2, IndianRupee, Wheat, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

type SellRow = {
  id: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  buyer: string;
  date: string;
};

const UNITS = ["Quintal", "Ton", "Kg", "Maund"];
const BUYERS = ["Mandi / APMC", "Local Trader", "Direct Consumer", "FPO / Cooperative", "Sugar Mill", "Other"];

const newRow = (): SellRow => ({
  id: Math.random().toString(36).slice(2),
  quantity: "", unit: "Quintal", pricePerUnit: "", buyer: "Mandi / APMC",
  date: new Date().toISOString().slice(0, 10),
});

export default function HarvestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const farmId = params.farmId as string;
  const fieldId = params.fieldId as string;
  const cycleId = searchParams.get("cycleId") ?? "";

  const farm = FARMS.find(f => f.id === farmId);
  const field = farm?.fields.find(f => f.id === fieldId);
  const cycle = CROP_CYCLES.find(c => c.id === cycleId);
  const expenses = getCycleExpenses(cycleId);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);

  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [actualYield, setActualYield] = useState(cycle?.expectedYield?.toString() ?? "");
  const [quality, setQuality] = useState<"A" | "B" | "C">("A");
  const [sellRows, setSellRows] = useState<SellRow[]>([newRow()]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"harvest" | "sell" | "confirm">("harvest");

  // Derived totals
  const totalRevenue = sellRows.reduce((a, r) => {
    const q = parseFloat(r.quantity) || 0;
    const p = parseFloat(r.pricePerUnit) || 0;
    return a + q * p;
  }, 0);
  const totalQtySold = sellRows.reduce((a, r) => a + (parseFloat(r.quantity) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const addRow = () => setSellRows(r => [...r, newRow()]);
  const removeRow = (id: string) => setSellRows(r => r.filter(x => x.id !== id));
  const updateRow = (id: string, k: keyof SellRow, v: string) =>
    setSellRows(r => r.map(x => x.id === id ? { ...x, [k]: v } : x));

  const validateHarvest = () => {
    const e: Record<string, string> = {};
    if (!harvestDate) e.date = "Select harvest date";
    if (!actualYield || isNaN(parseFloat(actualYield))) e.yield = "Enter actual yield";
    return e;
  };

  const validateSell = () => {
    const e: Record<string, string> = {};
    sellRows.forEach((r, i) => {
      if (!r.quantity || isNaN(parseFloat(r.quantity)) || parseFloat(r.quantity) <= 0)
        e[`qty_${i}`] = "Required";
      if (!r.pricePerUnit || isNaN(parseFloat(r.pricePerUnit)) || parseFloat(r.pricePerUnit) <= 0)
        e[`price_${i}`] = "Required";
      if (!r.date) e[`date_${i}`] = "Required";
    });
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

  const handleSubmit = () => setSubmitted(true);

  if (!cycle || !field) return (
    <div className="p-8 text-center text-gray-400">Cycle not found.</div>
  );

  if (submitted) return (
    <div>
      <TopBar title="Harvest Complete" />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-primary-600" />
          </div>
          <div className="text-4xl mb-2">🌾</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Harvest Recorded!</h2>
          <p className="text-sm text-gray-500 mb-5">
            {cycle.crop} from {field.name} — cycle closed
          </p>

          {/* Final P&L summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Final P&L for this crop</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Actual yield</span>
              <span className="font-semibold text-gray-700">{actualYield} Quintal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total sold</span>
              <span className="font-semibold text-gray-700">{totalQtySold.toFixed(1)} Q across {sellRows.length} lot{sellRows.length > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total expenses</span>
              <span className="font-semibold text-red-600">-{fmt(totalExpenses)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total revenue</span>
              <span className="font-semibold text-primary-600">+{fmt(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold text-gray-700">Net profit</span>
              <span className={`font-bold text-lg ${netProfit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                {netProfit >= 0 ? "+" : ""}{fmt(netProfit)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Profit margin</span>
              <span className={`font-semibold ${profitMargin >= 0 ? "text-primary-500" : "text-red-400"}`}>{profitMargin}%</span>
            </div>
          </div>

          {/* Sell lot breakdown */}
          <div className="bg-primary-50 rounded-xl p-3 text-left mb-5">
            <p className="text-xs font-semibold text-primary-700 mb-2">Sale transactions recorded</p>
            {sellRows.map((r, i) => (
              <div key={r.id} className="flex justify-between text-xs py-1 border-b border-primary-100 last:border-0">
                <span className="text-gray-500">{r.date} · {r.quantity}Q @ {fmt(parseFloat(r.pricePerUnit || "0"))}/{r.unit}</span>
                <span className="font-semibold text-primary-600">+{fmt((parseFloat(r.quantity) || 0) * (parseFloat(r.pricePerUnit) || 0))}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href={`/farms/${farmId}/fields/${fieldId}`} className="btn-secondary flex-1 justify-center">
              Back to field
            </Link>
            <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary flex-1 justify-center">
              Plant next crop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div>
      <TopBar title="Harvest & Sell" />
      <main className="p-4 lg:p-6 max-w-2xl mx-auto">

        {/* Back */}
        <Link href={`/farms/${farmId}/fields/${fieldId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to {field.name}
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {(["harvest", "sell", "confirm"] as const).map((s, i) => {
            const labels = ["Harvest details", "Sell lots", "Confirm P&L"];
            const past = ["harvest", "sell", "confirm"].indexOf(step) > i;
            const current = step === s;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  past ? "bg-primary-600 text-white" : current ? "bg-primary-600 text-white ring-4 ring-primary-100" : "bg-gray-100 text-gray-400"
                }`}>
                  {past ? <CheckCircle2 size={13} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${current ? "text-primary-700" : "text-gray-400"}`}>{labels[i]}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${past ? "bg-primary-400" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* Crop context strip */}
        <div className="card p-3 flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-xl">🌱</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{cycle.crop} · {field.name}</p>
            <p className="text-xs text-gray-400">Started {cycle.startDate} · {totalExpenses > 0 ? fmt(totalExpenses) + " invested" : "no expenses recorded"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Target yield</p>
            <p className="text-sm font-bold text-gray-700">{cycle.expectedYield} Q</p>
          </div>
        </div>

        {/* ── STEP 1: Harvest details ── */}
        {step === "harvest" && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Record harvest</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Harvest date <span className="text-red-500">*</span>
                </label>
                <input type="date" className="input" value={harvestDate}
                  onChange={e => setHarvestDate(e.target.value)} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Actual yield (Quintal) <span className="text-red-500">*</span>
                </label>
                <input type="number" step="0.1" min="0" className="input"
                  placeholder={cycle.expectedYield.toString()}
                  value={actualYield} onChange={e => setActualYield(e.target.value)} />
                {errors.yield && <p className="text-red-500 text-xs mt-1">{errors.yield}</p>}
              </div>
            </div>

            {/* Yield vs expected */}
            {actualYield && !isNaN(parseFloat(actualYield)) && (
              <div className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
                parseFloat(actualYield) >= cycle.expectedYield ? "bg-primary-50 border border-primary-100" : "bg-amber-50 border border-amber-100"
              }`}>
                {parseFloat(actualYield) >= cycle.expectedYield
                  ? <CheckCircle2 size={13} className="text-primary-500" />
                  : <AlertCircle size={13} className="text-amber-500" />}
                <span className={parseFloat(actualYield) >= cycle.expectedYield ? "text-primary-700" : "text-amber-700"}>
                  {parseFloat(actualYield) >= cycle.expectedYield
                    ? `${(parseFloat(actualYield) - cycle.expectedYield).toFixed(1)}Q above target 🎉`
                    : `${(cycle.expectedYield - parseFloat(actualYield)).toFixed(1)}Q below target`
                  }
                </span>
              </div>
            )}

            {/* Quality */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Quality grade</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { g: "A" as const, label: "Grade A", desc: "Premium", color: "border-primary-500 bg-primary-50 text-primary-700" },
                  { g: "B" as const, label: "Grade B", desc: "Good",    color: "border-amber-400 bg-amber-50 text-amber-700" },
                  { g: "C" as const, label: "Grade C", desc: "Average", color: "border-gray-400 bg-gray-50 text-gray-700" },
                ].map(q => (
                  <button key={q.g} type="button" onClick={() => setQuality(q.g)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${quality === q.g ? q.color : "border-gray-100 hover:border-gray-200"}`}>
                    <p className="text-sm font-bold">{q.label}</p>
                    <p className="text-xs text-gray-400">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea rows={2} className="input resize-none" placeholder="Storage location, observations…"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button onClick={goToSell} className="btn-primary w-full justify-center py-2.5">
              Next: Record sales →
            </button>
          </div>
        )}

        {/* ── STEP 2: Sell lots ── */}
        {step === "sell" && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Sell lots</h3>
                  <p className="text-xs text-gray-400">Add each truck/transaction separately</p>
                </div>
                <button onClick={addRow} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Plus size={12} /> Add lot
                </button>
              </div>

              <div className="space-y-4">
                {sellRows.map((row, i) => (
                  <div key={row.id} className="bg-gray-50 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600">Lot {i + 1}</p>
                      {sellRows.length > 1 && (
                        <button onClick={() => removeRow(row.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Qty + Unit */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Quantity <span className="text-red-500">*</span></label>
                        <div className="flex gap-1.5">
                          <input type="number" step="0.1" min="0" className="input"
                            placeholder="e.g. 5" value={row.quantity}
                            onChange={e => updateRow(row.id, "quantity", e.target.value)} />
                          <select className="input w-24 flex-shrink-0" value={row.unit}
                            onChange={e => updateRow(row.id, "unit", e.target.value)}>
                            {UNITS.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                        {errors[`qty_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`qty_${i}`]}</p>}
                      </div>
                      {/* Rate */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Rate per {row.unit} (₹) <span className="text-red-500">*</span></label>
                        <input type="number" min="1" className="input"
                          placeholder="e.g. 2400" value={row.pricePerUnit}
                          onChange={e => updateRow(row.id, "pricePerUnit", e.target.value)} />
                        {errors[`price_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`price_${i}`]}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Buyer */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Buyer</label>
                        <select className="input" value={row.buyer}
                          onChange={e => updateRow(row.id, "buyer", e.target.value)}>
                          {BUYERS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      {/* Date */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sale date <span className="text-red-500">*</span></label>
                        <input type="date" className="input" value={row.date}
                          onChange={e => updateRow(row.id, "date", e.target.value)} />
                        {errors[`date_${i}`] && <p className="text-red-500 text-xs mt-1">{errors[`date_${i}`]}</p>}
                      </div>
                    </div>

                    {/* Live lot total */}
                    {row.quantity && row.pricePerUnit && (
                      <div className="flex justify-between text-xs font-semibold bg-primary-50 rounded-lg p-2">
                        <span className="text-gray-500">Lot {i + 1} total</span>
                        <span className="text-primary-600">
                          +{fmt((parseFloat(row.quantity) || 0) * (parseFloat(row.pricePerUnit) || 0))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Running total */}
              {totalRevenue > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <span className="text-sm font-semibold text-gray-600">Total revenue from {sellRows.length} lot{sellRows.length > 1 ? "s" : ""}</span>
                  <span className="text-base font-bold text-primary-600">+{fmt(totalRevenue)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("harvest")} className="btn-secondary flex-1 justify-center">← Back</button>
              <button onClick={goToConfirm} className="btn-primary flex-1 justify-center py-2.5">Review P&L →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm P&L ── */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Final P&L — {cycle.crop}</h3>

              {/* Big profit number */}
              <div className={`rounded-2xl p-5 text-center mb-5 ${netProfit >= 0 ? "bg-primary-50 border border-primary-200" : "bg-red-50 border border-red-200"}`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">Net profit on this crop cycle</p>
                <p className={`text-4xl font-bold ${netProfit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                  {netProfit >= 0 ? "+" : ""}{fmt(netProfit)}
                </p>
                <p className="text-sm text-gray-400 mt-1">{profitMargin}% margin</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5"><Wheat size={13} /> Actual yield</span>
                  <span className="font-semibold text-gray-700">{actualYield} Quintal · Grade {quality}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5"><IndianRupee size={13} /> Total qty sold</span>
                  <span className="font-semibold text-gray-700">{totalQtySold.toFixed(1)} Q across {sellRows.length} lot{sellRows.length > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-red-500 flex items-center gap-1.5"><TrendingDown size={13} /> Total expenses</span>
                  <span className="font-bold text-red-600">-{fmt(totalExpenses)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-primary-600 flex items-center gap-1.5"><TrendingUp size={13} /> Total revenue</span>
                  <span className="font-bold text-primary-600">+{fmt(totalRevenue)}</span>
                </div>
              </div>

              {/* Expense breakdown */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Expenses detail ({expenses.length} entries)</p>
                <div className="space-y-1">
                  {expenses.map(e => (
                    <div key={e.id} className="flex justify-between text-xs">
                      <span className="text-gray-500">{e.date} · {e.description}</span>
                      <span className="text-red-500">-{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell lots breakdown */}
              <div className="bg-primary-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-primary-700 mb-2">Sale transactions ({sellRows.length} lots)</p>
                <div className="space-y-1">
                  {sellRows.map((r, i) => {
                    const tot = (parseFloat(r.quantity) || 0) * (parseFloat(r.pricePerUnit) || 0);
                    return (
                      <div key={r.id} className="flex justify-between text-xs">
                        <span className="text-gray-500">Lot {i + 1} · {r.date} · {r.quantity}Q @ {fmt(parseFloat(r.pricePerUnit || "0"))}/{r.unit} · {r.buyer}</span>
                        <span className="font-semibold text-primary-600">+{fmt(tot)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("sell")} className="btn-secondary flex-1 justify-center">← Edit lots</button>
              <button onClick={handleSubmit} className="btn-primary flex-1 justify-center py-2.5">
                ✓ Close crop cycle
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
