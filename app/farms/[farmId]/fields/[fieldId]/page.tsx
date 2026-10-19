"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import {
  FARMS, CROP_CYCLES, getCycleExpenses, getCyclePL, getFieldAnnualPL,
  getActiveCycle, getLastClosedCycle, getCycleSales, fmt
} from "@/lib/data";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Plus, Sparkles, Wheat, AlertCircle, Lightbulb,
  RefreshCw, IndianRupee, CheckCircle2, BarChart2, Clock
} from "lucide-react";

// ── AI Estimate Panel ──────────────────────────────────────────
function AIPanel({ cycleId }: { cycleId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<null | {
    estimatedYield: number; yieldUnit: string;
    minPrice: number; maxPrice: number; avgPrice: number;
    estimatedRevenue: number; estimatedProfit: number; profitMargin: number;
    risks: string[]; tips: string[];
    marketOutlook: string; confidence: "High" | "Medium" | "Low";
  }>(null);

  const cycle = CROP_CYCLES.find(c => c.id === cycleId);
  const farms = FARMS;
  const farm = farms.find(f => f.id === cycle?.farmId);
  const field = farm?.fields.find(f => f.id === cycle?.fieldId);
  const pl = getCyclePL(cycleId);

  const fetch_ = async () => {
    if (!cycle || !field) return;
    setLoading(true); setError(""); setResult(null);
    const prompt = `You are an expert Indian agricultural advisor.
Crop: ${cycle.crop}, Field: ${field.name}, Area: ${field.area} Acre
Soil: ${field.soil}, Irrigation: ${field.irrigation}
Sowing: ${cycle.startDate}, Season: ${cycle.season}, Location: ${farm?.location}
Farmer target yield: ${cycle.expectedYield} ${cycle.yieldUnit}
Expenses so far: ₹${pl.expenses}
Respond ONLY with valid JSON (no markdown):
{"estimatedYield":number,"yieldUnit":"Quintal","minPrice":number,"maxPrice":number,"avgPrice":number,"estimatedRevenue":number,"estimatedProfit":number,"profitMargin":number,"risks":["...","...","..."],"tips":["...","...","..."],"marketOutlook":"one sentence","confidence":"High"}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setResult(JSON.parse((data.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim()));
    } catch { setError("Could not fetch estimate. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-accent-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">AI Estimate</p>
            <p className="text-xs text-gray-400">Yield · Price · Profit</p>
          </div>
        </div>
        {result && <button onClick={fetch_} className="text-xs text-gray-400 hover:text-primary-600"><RefreshCw size={12} /></button>}
      </div>

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-xs text-gray-500 mb-3">AI-powered yield & profit prediction based on crop, soil, season & mandi rates</p>
          <button onClick={fetch_} className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Get Estimate
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-2" style={{ border: "3px solid #dcfce7", borderTopColor: "#16a34a" }} />
          <p className="text-xs text-gray-400">Analysing crop data…</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-3 text-xs text-red-600 flex items-start gap-2">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
          <button onClick={fetch_} className="underline ml-1">Retry</button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <span className={result.confidence === "High" ? "badge-active" : result.confidence === "Medium" ? "badge-yellow" : "badge-empty"}>
              {result.confidence} confidence
            </span>
          </div>
          {/* Key numbers 2×2 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary-50 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-400">Est. yield</p>
              <p className="text-base font-bold text-primary-700">{result.estimatedYield} {result.yieldUnit}</p>
            </div>
            <div className="bg-accent-50 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-400">Rate range</p>
              <p className="text-xs font-bold text-accent-700">{fmt(result.minPrice)}–{fmt(result.maxPrice)}</p>
              <p className="text-xs text-accent-500">per {result.yieldUnit}</p>
            </div>
            <div className="bg-primary-50 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-400">Est. revenue</p>
              <p className="text-base font-bold text-primary-600">{fmt(result.estimatedRevenue)}</p>
            </div>
            <div className={`rounded-lg p-2.5 text-center ${result.estimatedProfit >= 0 ? "bg-accent-50" : "bg-red-50"}`}>
              <p className="text-xs text-gray-400">Est. profit</p>
              <p className={`text-base font-bold ${result.estimatedProfit >= 0 ? "text-accent-700" : "text-red-600"}`}>{fmt(result.estimatedProfit)}</p>
              <p className="text-xs text-gray-400">{result.profitMargin}% margin</p>
            </div>
          </div>
          {/* Market */}
          <div className="bg-blue-50 rounded-lg p-2.5 text-xs text-blue-700 flex items-start gap-1.5">
            <TrendingUp size={12} className="flex-shrink-0 mt-0.5" /> {result.marketOutlook}
          </div>
          {/* Risks + Tips */}
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><AlertCircle size={10} className="text-orange-400" /> Risks</p>
              {result.risks.map((r, i) => <p key={i} className="text-xs text-gray-500 flex gap-1.5 mb-1"><span className="text-orange-400 flex-shrink-0">⚠</span>{r}</p>)}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><Lightbulb size={10} className="text-accent-500" /> Tips</p>
              {result.tips.map((t, i) => <p key={i} className="text-xs text-gray-500 flex gap-1.5 mb-1"><span className="text-primary-500 flex-shrink-0">✓</span>{t}</p>)}
            </div>
          </div>
          <p className="text-xs text-gray-300 text-center">Estimates are indicative only</p>
        </div>
      )}
    </div>
  );
}

// ── Main Field Page ────────────────────────────────────────────
export default function FieldPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const fieldId = params.fieldId as string;

  const farm = FARMS.find(f => f.id === farmId);
  const field = farm?.fields.find(f => f.id === fieldId);

  if (!field || !farm) return <div className="p-8 text-center text-gray-400">Field not found.</div>;

  const active = getActiveCycle(fieldId);
  const activePL = active ? getCyclePL(active.id) : null;
  const activeExpenses = active ? getCycleExpenses(active.id) : [];
  const annualPL = getFieldAnnualPL(fieldId);

  // Harvest readiness check
  const isHarvestReady = (() => {
    if (!active?.expectedHarvestDate) return false;
    const daysLeft = Math.ceil(
      (new Date(active.expectedHarvestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 7;
  })();

  return (
    <div>
      <TopBar title={field.name} />
      <main className="p-4 lg:p-6 space-y-5">

        {/* Field meta strip */}
        <div className="flex items-center gap-3">
          <Link href={`/farms/${farmId}/fields`} className="text-gray-400 hover:text-primary-600 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800">{field.name}</h2>
            <p className="text-xs text-gray-400">{farm.name} · {field.area}Ac · {field.soil} · {field.irrigation}</p>
            {isHarvestReady && active && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-amber-700">
                  Ready to Harvest · {active.expectedHarvestDate}
                </span>
              </div>
            )}
          </div>
          <button className="btn-secondary text-xs py-1.5 px-3">Edit field</button>
        </div>

        {/* ── ACTIVE CROP SECTION ── */}
        {active && activePL ? (
          <div>
            {/* Financial Summary Bar */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                  <TrendingDown size={10} className="text-red-400" /> Invested
                </p>
                <p className="text-base font-bold text-red-600 mt-0.5">{fmt(activePL.expenses)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                  <TrendingUp size={10} className="text-gray-300" /> Revenue
                </p>
                <p className="text-sm font-bold text-gray-300 mt-0.5">Pending</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Net Profit</p>
                <p className="text-sm font-bold text-gray-300 mt-0.5">—</p>
              </div>
            </div>

            {/* Section header with action buttons */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                Active crop
              </h3>
              <div className="flex gap-2">
                <Link href={`/farms/${farmId}/expenses/add?fieldId=${fieldId}&cycleId=${active.id}`}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Plus size={12} /> Add expense
                </Link>
                <Link href={`/farms/${farmId}/fields/${fieldId}/harvest?cycleId=${active.id}`}
                  className={`text-xs py-1.5 px-3 flex items-center gap-1 ${
                    isHarvestReady
                      ? "bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                      : "btn-primary"
                  }`}>
                  <Wheat size={12} /> {isHarvestReady ? "⚡ Harvest Now" : "Harvest & Sell"}
                </Link>
              </div>
            </div>

            {/* Two-panel layout: left = expenses, right = AI */}
            <div className="grid lg:grid-cols-2 gap-4">

              {/* LEFT: Active cycle detail */}
              <div className="card p-4">
                {/* Crop header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🌱</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{active.crop}</p>
                    <p className="text-xs text-gray-400">Started {active.startDate} · {active.season}</p>
                  </div>
                  <span className="badge-yellow">Active</span>
                </div>

                {/* Summary numbers */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-red-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Invested</p>
                    <p className="text-base font-bold text-red-600">{fmt(activePL.expenses)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-sm font-bold text-gray-300">Pending</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Target</p>
                    <p className="text-sm font-bold text-gray-600">{active.expectedYield}Q</p>
                  </div>
                </div>

                {/* Itemised expenses - date & item wise */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500">Expense log</p>
                  <Link href={`/farms/${farmId}/expenses/add?fieldId=${fieldId}&cycleId=${active.id}`}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                    <Plus size={11} /> Add
                  </Link>
                </div>

                {activeExpenses.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">No expenses recorded yet</div>
                ) : (
                  <div className="space-y-0">
                    {/* Group by date */}
                    {(() => {
                      const byDate: Record<string, typeof activeExpenses> = {};
                      activeExpenses.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
                      return Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
                        <div key={date}>
                          <p className="text-xs text-gray-400 font-medium py-1.5 border-b border-gray-100">{date}</p>
                          {items.map(e => (
                            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{e.description}</p>
                                <span className="text-xs text-gray-400">{e.category}</span>
                              </div>
                              <span className="text-xs font-semibold text-red-500 ml-3 flex-shrink-0">-{fmt(e.amount)}</span>
                            </div>
                          ))}
                        </div>
                      ));
                    })()}
                    <div className="flex justify-between pt-2 text-xs font-bold border-t border-gray-200 mt-1">
                      <span className="text-gray-600">Total spent</span>
                      <span className="text-red-600">-{fmt(activePL.expenses)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: AI Panel */}
              <AIPanel cycleId={active.id} />
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center border-dashed border-2 border-gray-200">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No active crop</p>
            <p className="text-xs text-gray-400 mb-4">Plant a crop to start tracking expenses and get AI yield estimates</p>
            <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary inline-flex items-center gap-1.5">
              <Plus size={14} /> Plant a crop
            </Link>
          </div>
        )}

        {/* ── ANNUAL P&L HISTORY ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <BarChart2 size={15} className="text-primary-500" /> P&L history
            </h3>
            <span className="text-xs text-gray-400">Closed cycles only · last 3 years</span>
          </div>

          {/* Profit trend bars */}
          {annualPL.length > 0 && (
            <div className="card p-4 mb-4">
              <div className="flex items-end gap-2 h-20">
                {annualPL.slice(0, 3).reverse().map(yr => {
                  const maxP = Math.max(...annualPL.map(y => Math.abs(y.profit)), 1);
                  const pct = Math.max(8, (Math.abs(yr.profit) / maxP) * 100);
                  return (
                    <div key={yr.year} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <p className="text-xs font-semibold text-primary-600">{fmt(yr.profit)}</p>
                      <div className={`w-full rounded-t-md ${yr.profit >= 0 ? "bg-primary-400" : "bg-red-400"}`}
                        style={{ height: `${pct}%` }} />
                      <p className="text-xs text-gray-400 whitespace-nowrap">{yr.label}</p>
                    </div>
                  );
                })}
                {annualPL.length === 0 && <p className="text-xs text-gray-400 m-auto">No data yet</p>}
              </div>
            </div>
          )}

          {annualPL.length === 0 ? (
            <div className="card p-6 text-center text-xs text-gray-400">No closed cycles yet</div>
          ) : (
            <div className="space-y-3">
              {annualPL.slice(0, 3).map((yr, idx) => (
                <div key={yr.year} className="card overflow-hidden">
                  {/* Year header row */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="badge-yellow">Latest</span>}
                      <p className="font-bold text-gray-800 text-sm">{yr.label}</p>
                      <span className="text-xs text-gray-400">{yr.cycles.length} crop{yr.cycles.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-red-400 hidden sm:inline">-{fmt(yr.expenses)}</span>
                      <span className="text-primary-500 hidden sm:inline">+{fmt(yr.revenue)}</span>
                      <span className={`font-bold text-sm ${yr.profit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                        {yr.profit >= 0 ? "+" : ""}{fmt(yr.profit)}
                      </span>
                    </div>
                  </div>

                  {/* Per-crop rows within the year */}
                  {yr.cycles.map(cycle => {
                    const pl = getCyclePL(cycle.id);
                    const sales = getCycleSales(cycle.id);
                    return (
                      <div key={cycle.id} className="border-b border-gray-50 last:border-0">
                        {/* Cycle summary row — clickable */}
                        <Link href={`/farms/${farmId}/crop-cycles/${cycle.id}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-primary-50/30 transition-colors block">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🌾</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{cycle.crop}</p>
                              <p className="text-xs text-gray-400">{cycle.startDate} → {cycle.endDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400">-{fmt(pl.expenses)} exp</p>
                              <p className="text-xs text-gray-400">+{fmt(pl.revenue)} rev</p>
                            </div>
                            <p className={`text-sm font-bold ${pl.profit >= 0 ? "text-primary-600" : "text-red-500"}`}>
                              {pl.profit >= 0 ? "+" : ""}{fmt(pl.profit)}
                            </p>
                            <ChevronRight size={14} className="text-gray-300" />
                          </div>
                        </Link>

                        {/* Sell transactions for this cycle — shown inline */}
                        {sales.length > 0 && (
                          <div className="px-4 pb-3 bg-primary-50/20">
                            <p className="text-xs text-gray-400 mb-1.5 font-medium">Sale transactions</p>
                            <div className="space-y-1">
                              {sales.map(s => (
                                <div key={s.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">{s.date} · {s.quantity}{s.unit} @ {fmt(s.pricePerUnit)}/{s.unit}</span>
                                  <span className="font-semibold text-primary-600">+{fmt(s.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
