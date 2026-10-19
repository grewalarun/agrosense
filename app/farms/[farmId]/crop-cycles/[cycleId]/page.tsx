"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { CROP_CYCLES, FARMS, getCycleExpenses, getCycleSales, getCyclePL, fmt } from "@/lib/data";
import { useState } from "react";
import { ChevronLeft, Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, RefreshCw, Award } from "lucide-react";

const catColor: Record<string, string> = {
  Seeds: "bg-green-100 text-green-700", Fertilizer: "bg-blue-100 text-blue-700",
  Pesticide: "bg-orange-100 text-orange-700", Labour: "bg-purple-100 text-purple-700",
  Equipment: "bg-gray-100 text-gray-600", Irrigation: "bg-cyan-100 text-cyan-700",
  Transport: "bg-pink-100 text-pink-700", Storage: "bg-yellow-100 text-yellow-700",
};
const qualityColor = { A: "text-primary-600 bg-primary-50", B: "text-amber-600 bg-amber-50", C: "text-gray-500 bg-gray-50" };

export default function CropDetailPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const cycleId = params.cycleId as string;

  const cycle = CROP_CYCLES.find(c => c.id === cycleId);
  const farm = FARMS.find(f => f.id === farmId);
  const field = farm?.fields.find(f => f.id === cycle?.fieldId);
  const expenses = getCycleExpenses(cycleId);
  const sales = getCycleSales(cycleId);
  const pl = getCyclePL(cycleId);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    estimatedYield: number; yieldUnit: string; minPrice: number; maxPrice: number;
    avgPrice: number; estimatedRevenue: number; estimatedProfit: number;
    profitMargin: number; risks: string[]; tips: string[]; marketOutlook: string;
    confidence: "High" | "Medium" | "Low";
  }>(null);
  const [aiError, setAiError] = useState("");

  const fetchAiEstimate = async () => {
    if (!cycle || !field) return;
    setAiLoading(true); setAiError(""); setAiResult(null);
    const prompt = `You are an expert Indian agricultural advisor.
Crop: ${cycle.crop}, Field: ${field.name}, Area: ${field.area} Acre
Soil: ${field.soil}, Irrigation: ${field.irrigation}, Sowing: ${cycle.startDate}
Season: ${cycle.season}, Location: ${farm?.location}
Farmer's expected yield: ${cycle.expectedYield} ${cycle.yieldUnit}
Total expenses so far: ₹${pl.expenses}

Respond ONLY with valid JSON, no markdown:
{"estimatedYield":number,"yieldUnit":"Quintal","minPrice":number,"maxPrice":number,"avgPrice":number,"estimatedRevenue":number,"estimatedProfit":number,"profitMargin":number,"risks":["...","...","..."],"tips":["...","...","..."],"marketOutlook":"one sentence","confidence":"High"|"Medium"|"Low"}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "";
      setAiResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setAiError("Could not fetch AI estimate. Please try again."); }
    finally { setAiLoading(false); }
  };

  if (!cycle) return <div className="p-8 text-center text-gray-400">Crop cycle not found.</div>;

  const isActive = cycle.status === "Active";
  const isClosed = cycle.status === "Harvested";
  const expenseByCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>);

  return (
    <div>
      <TopBar title={`${cycle.crop} · ${field?.name}`} />
      <main className="p-4 lg:p-6 space-y-5 max-w-2xl">
        <Link href={`/farms/${farmId}/fields/${cycle.fieldId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ChevronLeft size={16} /> Back to {field?.name}
        </Link>

        {/* Cycle header */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                {isActive ? "🌱" : "🌾"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{cycle.crop}</h2>
                <p className="text-sm text-gray-500">{field?.name} · {field?.area} Acre · {field?.soil}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cycle.season}</p>
              </div>
            </div>
            <span className={isActive ? "badge-yellow" : "badge-active"}>{cycle.status}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Sown", value: cycle.startDate },
              { label: isClosed ? "Harvested" : "Est. harvest", value: cycle.endDate ?? "Pending" },
              { label: "Target yield", value: `${cycle.expectedYield} ${cycle.yieldUnit}` },
              { label: isClosed ? "Actual yield" : "Status", value: cycle.actualYield ? `${cycle.actualYield} ${cycle.yieldUnit}` : isActive ? "Growing" : "—" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-bold text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CROP P&L — the full breakdown ── */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {isClosed ? "Final P&L" : "P&L in progress"}
          </h3>

          {/* Top-line numbers */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-center"><TrendingDown size={11} className="text-red-400" />Total expenses</p>
              <p className="text-lg font-bold text-red-600 mt-0.5">{fmt(pl.expenses)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${isClosed ? "bg-primary-50 border-primary-100" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-center"><TrendingUp size={11} className={isClosed ? "text-primary-500" : "text-gray-300"} />Revenue</p>
              <p className={`text-lg font-bold mt-0.5 ${isClosed ? "text-primary-600" : "text-gray-300"}`}>
                {isClosed ? fmt(pl.revenue) : "Pending"}
              </p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${isClosed ? (pl.profit >= 0 ? "bg-accent-50 border-accent-200" : "bg-red-50 border-red-100") : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs text-gray-400">Net profit</p>
              <p className={`text-lg font-bold mt-0.5 ${isClosed ? (pl.profit >= 0 ? "text-accent-700" : "text-red-600") : "text-gray-300"}`}>
                {isClosed ? `${pl.profit >= 0 ? "+" : ""}${fmt(pl.profit)}` : "—"}
              </p>
            </div>
          </div>

          {/* Expense breakdown by category */}
          {expenses.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Expense breakdown</p>
              <div className="space-y-2">
                {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                  const pct = Math.round((amt / pl.expenses) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor[cat] || "bg-gray-100 text-gray-600"}`}>{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{pct}%</span>
                          <span className="font-semibold text-red-600">{fmt(amt)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-300 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Individual expense lines */}
              <details className="mt-3">
                <summary className="text-xs text-primary-600 cursor-pointer hover:underline">View all {expenses.length} expense entries</summary>
                <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">
                  {expenses.map(e => (
                    <div key={e.id} className="flex justify-between text-xs py-1">
                      <div>
                        <span className="font-medium text-gray-700">{e.description}</span>
                        <span className="text-gray-400 ml-2">{e.date}</span>
                      </div>
                      <span className="font-semibold text-red-500">-{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Sales breakdown */}
          {sales.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Revenue breakdown ({sales.length} sale{sales.length > 1 ? "s" : ""})</p>
              <div className="space-y-2">
                {sales.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-700">{s.quantity} {s.unit} → {s.buyer}</p>
                      <p className="text-gray-400">{fmt(s.pricePerUnit)}/{s.unit} · {s.date}</p>
                    </div>
                    <span className="font-bold text-primary-600">+{fmt(s.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-1 font-bold border-t border-gray-100">
                  <span className="text-gray-600">Total revenue</span>
                  <span className="text-primary-600">+{fmt(pl.revenue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── AI ADVISOR (active crops only) ── */}
        {isActive && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-accent-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">AI Crop Advisor</h3>
                  <p className="text-xs text-gray-400">Estimated yield, price & profit</p>
                </div>
              </div>
              {aiResult && (
                <button onClick={fetchAiEstimate} className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1">
                  <RefreshCw size={12} /> Refresh
                </button>
              )}
            </div>

            {!aiResult && !aiLoading && (
              <div className="text-center py-5">
                <p className="text-sm text-gray-500 mb-1">Get AI-powered yield & profit estimate</p>
                <p className="text-xs text-gray-400 mb-4">Based on crop, soil, area, season & current mandi rates</p>
                <button onClick={fetchAiEstimate} className="btn-primary inline-flex items-center gap-2 px-5 py-2">
                  <Sparkles size={14} /> Get AI Estimate
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="text-center py-6">
                <div className="w-10 h-10 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" style={{ border: "3px solid", borderTopColor: "#16a34a" }} />
                <p className="text-sm text-gray-500">Analysing crop data and mandi rates…</p>
              </div>
            )}

            {aiError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600">{aiError}</p>
                  <button onClick={fetchAiEstimate} className="text-xs text-red-400 hover:underline mt-1">Try again</button>
                </div>
              </div>
            )}

            {aiResult && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <span className={aiResult.confidence === "High" ? "badge-active" : aiResult.confidence === "Medium" ? "badge-yellow" : "badge-empty"}>
                    {aiResult.confidence} confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">Est. yield</p>
                    <p className="text-xl font-bold text-primary-700">{aiResult.estimatedYield} {aiResult.yieldUnit}</p>
                  </div>
                  <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">Mandi price range</p>
                    <p className="text-sm font-bold text-accent-700">{fmt(aiResult.minPrice)}–{fmt(aiResult.maxPrice)}</p>
                    <p className="text-xs text-accent-600">per {aiResult.yieldUnit}</p>
                  </div>
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">Est. revenue</p>
                    <p className="text-xl font-bold text-primary-600">{fmt(aiResult.estimatedRevenue)}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center border ${aiResult.estimatedProfit >= 0 ? "bg-accent-50 border-accent-200" : "bg-red-50 border-red-100"}`}>
                    <p className="text-xs text-gray-400">Est. profit</p>
                    <p className={`text-xl font-bold ${aiResult.estimatedProfit >= 0 ? "text-accent-700" : "text-red-600"}`}>{fmt(aiResult.estimatedProfit)}</p>
                    <p className="text-xs text-gray-400">{aiResult.profitMargin}% margin</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><TrendingUp size={11} /> Market outlook</p>
                  <p className="text-xs text-blue-700">{aiResult.marketOutlook}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><AlertCircle size={11} className="text-orange-400" /> Risks</p>
                    <ul className="space-y-1.5">
                      {aiResult.risks.map((r, i) => <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-orange-400">⚠</span>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Lightbulb size={11} className="text-accent-500" /> Tips</p>
                    <ul className="space-y-1.5">
                      {aiResult.tips.map((t, i) => <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-primary-500">✓</span>{t}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-300 text-center">AI estimates are indicative. Actual results may vary.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
