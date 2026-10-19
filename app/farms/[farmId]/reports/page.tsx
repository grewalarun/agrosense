import TopBar from "@/components/TopBar";
import { SALES, EXPENSES, HARVESTS, CROP_CYCLES, FARMS, getCyclePL, fmt } from "@/lib/data";
import { TrendingUp, TrendingDown, BarChart2, Wheat, Award, Star } from "lucide-react";

const revenue  = SALES.reduce((a, s) => a + s.total, 0);
const expenses = EXPENSES.reduce((a, e) => a + e.amount, 0);
const profit   = revenue - expenses;
const roi      = expenses > 0 ? Math.round((profit / expenses) * 100) : 0;

// Category breakdown (closed cycles only)
const closedExpenses = EXPENSES.filter(e =>
  CROP_CYCLES.find(c => c.id === e.cycleId && c.status === "Harvested")
);
const expenseByCategory = closedExpenses.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + e.amount;
  return acc;
}, {} as Record<string, number>);
const maxExpense = Math.max(...Object.values(expenseByCategory), 1);

// Revenue by crop
const salesByCrop = SALES.reduce((acc, s) => {
  acc[s.crop] = (acc[s.crop] || 0) + s.total;
  return acc;
}, {} as Record<string, number>);
const maxSale = Math.max(...Object.values(salesByCrop), 1);

// Season summary: each closed crop cycle as a row
const farm = FARMS[0];
const closedCycles = CROP_CYCLES.filter(c => c.status === "Harvested");
const seasonRows = closedCycles.map(cc => {
  const pl    = getCyclePL(cc.id);
  const field = farm?.fields.find(f => f.id === cc.fieldId);
  const roi   = pl.expenses > 0 ? Math.round((pl.profit / pl.expenses) * 100) : 0;
  const harvest = HARVESTS.find(h => h.cycleId === cc.id);
  return { cc, field, pl, roi, harvest };
}).sort((a, b) => (b.cc.endDate ?? "").localeCompare(a.cc.endDate ?? ""));

// Best crop by avg profit
const profitByCrop: Record<string, number[]> = {};
closedCycles.forEach(cc => {
  const { profit } = getCyclePL(cc.id);
  if (!profitByCrop[cc.crop]) profitByCrop[cc.crop] = [];
  profitByCrop[cc.crop].push(profit);
});
const bestCropEntry = Object.entries(profitByCrop)
  .map(([crop, vals]) => ({ crop, avg: Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) }))
  .sort((a, b) => b.avg - a.avg)[0];

// Field performance: profit per acre
const fieldPerf = farm?.fields.map(f => {
  const cycles = closedCycles.filter(c => c.fieldId === f.id);
  const totalProfit = cycles.reduce((a, c) => a + getCyclePL(c.id).profit, 0);
  const perAcre = f.area > 0 ? Math.round(totalProfit / f.area) : 0;
  return { field: f, totalProfit, perAcre };
}).sort((a, b) => b.perAcre - a.perAcre) ?? [];
const maxPerAcre = Math.max(...fieldPerf.map(f => Math.abs(f.perAcre)), 1);

export default function ReportsPage(_: { params: Promise<{ farmId: string }> }) {
  return (
    <div>
      <TopBar title="Reports" />
      <main className="p-4 lg:p-6 space-y-5">

        {/* Top-line P&L */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-primary-600" /> Overall P&amp;L Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue",  value: fmt(revenue),  color: "text-primary-600", bg: "bg-primary-50 border-primary-100", Icon: TrendingUp },
              { label: "Total Expenses", value: fmt(expenses), color: "text-red-600",     bg: "bg-red-50 border-red-100",         Icon: TrendingDown },
              { label: "Net Profit",     value: fmt(profit),   color: profit >= 0 ? "text-accent-700" : "text-red-600",  bg: profit >= 0 ? "bg-accent-50 border-accent-200" : "bg-red-50 border-red-100", Icon: TrendingUp },
              { label: "ROI",            value: `${roi}%`,     color: roi >= 0 ? "text-primary-700" : "text-red-600",   bg: "bg-primary-50 border-primary-100", Icon: BarChart2 },
            ].map(item => (
              <div key={item.label} className={`${item.bg} border rounded-xl p-3`}>
                <item.Icon size={14} className={item.color} />
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color} mt-0.5`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best crop callout */}
        {bestCropEntry && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">Most Profitable Crop</p>
              <p className="text-sm font-bold text-amber-900">
                🌾 {bestCropEntry.crop} — avg {bestCropEntry.avg >= 0 ? "+" : ""}{fmt(bestCropEntry.avg)} profit per cycle
              </p>
            </div>
          </div>
        )}

        {/* Season Summary Table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Wheat size={15} className="text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-800">Season Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Crop", "Field", "Season", "Expenses", "Revenue", "Profit", "ROI%"].map(h => (
                    <th key={h} className={`text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap ${["Expenses","Revenue","Profit","ROI%"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonRows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">No closed crop cycles yet</td></tr>
                ) : seasonRows.map(({ cc, field, pl, roi: rowRoi, harvest }) => (
                  <tr key={cc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-xs">{cc.crop}</p>
                      {harvest && <p className="text-xs text-gray-400">{harvest.quantity} {harvest.unit} · Grade {harvest.quality}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{field?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{cc.season}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-red-600">{fmt(pl.expenses)}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-primary-600">{pl.revenue > 0 ? fmt(pl.revenue) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold ${pl.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>
                        {pl.profit >= 0 ? "+" : ""}{fmt(pl.profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rowRoi >= 50 ? "bg-primary-100 text-primary-700" : rowRoi >= 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        {rowRoi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {seasonRows.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-red-600">{fmt(expenses)}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-primary-600">{fmt(revenue)}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-primary-700">+{fmt(profit)}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-primary-700">{roi}%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Field Performance per acre */}
        {fieldPerf.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award size={15} className="text-primary-600" /> Field Performance (profit per acre)
            </h3>
            <div className="space-y-3">
              {fieldPerf.map(({ field, totalProfit, perAcre }) => (
                <div key={field.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{field.name} <span className="text-gray-400">· {field.area} Ac</span></span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Total: {totalProfit >= 0 ? "+" : ""}{fmt(totalProfit)}</span>
                      <span className={`font-bold ${perAcre >= 0 ? "text-primary-700" : "text-red-600"}`}>{perAcre >= 0 ? "+" : ""}{fmt(perAcre)}/ac</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${perAcre >= 0 ? "bg-primary-400" : "bg-red-300"}`}
                      style={{ width: `${(Math.abs(perAcre) / maxPerAcre) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-col: Expenses by category + Revenue by crop */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Expenses by Category</h3>
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No closed cycle expenses yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{cat}</span>
                      <span className="text-red-600 font-semibold">{fmt(amt)} <span className="text-gray-400">({Math.round((amt / expenses) * 100)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-300 rounded-full" style={{ width: `${(amt / maxExpense) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Crop</h3>
            {Object.keys(salesByCrop).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No sales recorded yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(salesByCrop).sort((a, b) => b[1] - a[1]).map(([crop, amt]) => (
                  <div key={crop}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">🌾 {crop}</span>
                      <span className="text-primary-700 font-semibold">{fmt(amt)} <span className="text-gray-400">({Math.round((amt / revenue) * 100)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-400 rounded-full" style={{ width: `${(amt / maxSale) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
