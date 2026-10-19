"use client";
import { useState } from "react";
import { AlertCircle, Lightbulb, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { fmt } from "@/lib/format";

// ── AI Estimate Panel ──────────────────────────────────────────
export type AIEstimateInput = {
  crop: string;
  fieldName: string;
  area: string;
  soil?: string;
  irrigation?: string;
  startDate: string;
  season: string;
  location: string;
  expectedYield: number | null;
  yieldUnit: string;
  expenses: number;
};

export default function AIEstimatePanel({ input }: { input: AIEstimateInput }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<null | {
    estimatedYield: number; yieldUnit: string;
    minPrice: number; maxPrice: number; avgPrice: number;
    estimatedRevenue: number; estimatedProfit: number; profitMargin: number;
    risks: string[]; tips: string[];
    marketOutlook: string; confidence: "High" | "Medium" | "Low";
  }>(null);

  const fetch_ = async () => {
    setLoading(true); setError(""); setResult(null);
    const prompt = `You are an expert Indian agricultural advisor.
Crop: ${input.crop}, Field: ${input.fieldName}, Area: ${input.area}
Soil: ${input.soil || "unknown"}, Irrigation: ${input.irrigation || "unknown"}
Sowing: ${input.startDate}, Season: ${input.season}, Location: ${input.location || "India"}
Farmer target yield: ${input.expectedYield ?? "not set"} ${input.yieldUnit}
Expenses so far: ₹${input.expenses}
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
