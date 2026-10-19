import Link from "next/link";
import TopBar from "@/components/TopBar";
import ProfitColumns from "@/components/charts/ProfitColumns";
import BarList from "@/components/charts/BarList";
import { CHART } from "@/components/charts/colors";
import { TrendingUp, TrendingDown, BarChart2, Wheat, Award, Star, Clock } from "lucide-react";
import { getFarm } from "@/lib/api/farms";
import { getAllCycleRows, getSeason, getSeasons } from "@/lib/api/reports";
import { cropEmoji } from "@/lib/crops";
import { CYCLE_STATUS, areaUnitShort, categoryLabel, fmt, signedFmt, unitLabel } from "@/lib/format";
import type { CycleRow, ExpenseCategory, ReportTotals } from "@/lib/types";

const DONE = ["HARVESTED", "CLOSED"];
const seasonKey = (s: { seasonType: string; seasonYear: string }) => `${s.seasonType}-${s.seasonYear}`;

function byCropFromRows(rows: CycleRow[]) {
  const groups = new Map<string, { crop: string; cycles: number; expenses: number; revenue: number; profit: number }>();
  for (const r of rows) {
    const name = r.crop?.name ?? "Unknown";
    const g = groups.get(name) ?? { crop: name, cycles: 0, expenses: 0, revenue: 0, profit: 0 };
    g.cycles++; g.expenses += r.expenses; g.revenue += r.revenue; g.profit += r.profit;
    groups.set(name, g);
  }
  return [...groups.values()].sort((a, b) => b.profit - a.profit);
}

// Profit per area of each field over harvested crops, in the field's own unit
function fieldPerformance(rows: CycleRow[]) {
  const groups = new Map<string, { name: string; area: number; unit: string; profit: number; crops: number }>();
  for (const r of rows.filter(r => DONE.includes(r.status) && r.field)) {
    const f = r.field!;
    const g = groups.get(f._id) ?? { name: f.name, area: f.area, unit: areaUnitShort(f.areaUnit), profit: 0, crops: 0 };
    g.profit += r.profit; g.crops++;
    groups.set(f._id, g);
  }
  return [...groups.values()]
    .map(g => ({ ...g, perArea: g.area > 0 ? Math.round(g.profit / g.area) : 0 }))
    .sort((a, b) => b.perArea - a.perArea);
}

export default async function ReportsPage(props: PageProps<"/farms/[farmId]/reports">) {
  const { farmId } = await props.params;
  const { season: seasonParam } = await props.searchParams;
  const [farm, { seasons, totals: allTotals }] = await Promise.all([getFarm(farmId), getSeasons(farmId)]);

  const selected = seasons.find(s => seasonKey(s) === seasonParam);
  let rows: CycleRow[];
  let totals: ReportTotals;
  if (selected) {
    const detail = await getSeason(selected.seasonType, selected.seasonYear, farmId);
    rows = [...detail.cycles].reverse();
    totals = detail.totals;
  } else {
    rows = (await getAllCycleRows(farmId)).cycles;
    totals = allTotals;
  }

  const roi = totals.expenses > 0 ? Math.round((totals.profit / totals.expenses) * 100) : null;
  const growing = rows.filter(r => r.status === "ACTIVE" || r.status === "PLANNED");
  const growingSpend = growing.reduce((sum, r) => sum + r.expenses, 0);
  const crops = byCropFromRows(rows);
  const bestCrop = byCropFromRows(rows.filter(r => DONE.includes(r.status)))[0];
  const fields = fieldPerformance(rows);
  const categories = (Object.entries(totals.expensesByCategory) as [ExpenseCategory, number][]).sort((a, b) => b[1] - a[1]);
  const seasonPoints = [...seasons].reverse().slice(-8).map(s => ({ label: s.season, profit: s.profit, revenue: s.revenue, expenses: s.expenses }));

  return (
    <div>
      <TopBar title="Reports" />
      <main className="p-4 lg:p-6 space-y-5">

        {/* Season filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[{ key: undefined, label: "All seasons" }, ...seasons.map(s => ({ key: seasonKey(s), label: s.season }))].map(s => (
            <Link key={s.label} href={s.key ? `/farms/${farmId}/reports?season=${s.key}` : `/farms/${farmId}/reports`}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium border transition-colors ${s.key === seasonKey(selected ?? { seasonType: "", seasonYear: "" }) || (!s.key && !selected) ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-200 text-gray-600 hover:border-primary-300"}`}>
              {s.label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-gray-500">No crops recorded on {farm.name} yet. Reports appear once you plant a crop and record expenses or sales.</p>
          </div>
        ) : (
          <>
            {/* Top-line P&L */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-primary-600" /> {selected ? selected.season : `${farm.name} · all seasons`}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Revenue", value: fmt(totals.revenue), Icon: TrendingUp, tone: "text-primary-700" },
                  { label: "Expenses", value: fmt(totals.expenses), Icon: TrendingDown, tone: "text-gray-800" },
                  { label: "Net profit", value: signedFmt(totals.profit), Icon: totals.profit >= 0 ? TrendingUp : TrendingDown, tone: totals.profit >= 0 ? "text-primary-700" : "text-red-600" },
                  { label: "Return on cost", value: roi === null ? "—" : `${roi}%`, Icon: BarChart2, tone: "text-gray-800" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <item.Icon size={14} className="text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              {totals.profitPerArea !== null && totals.areaUnit && (
                <p className="text-xs text-gray-500 mt-3">{signedFmt(totals.profitPerArea)} per {areaUnitShort(totals.areaUnit)} over {totals.area} {areaUnitShort(totals.areaUnit)} cultivated</p>
              )}
              {growing.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-3 flex items-center gap-1.5">
                  <Clock size={12} /> Includes {growing.length} crop{growing.length > 1 ? "s" : ""} not yet harvested ({fmt(growingSpend)} spent so far) — profit rises as they are sold.
                </p>
              )}
            </div>

            {/* Profit by season */}
            {!selected && seasonPoints.length > 1 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Profit by season</h3>
                <ProfitColumns points={seasonPoints} />
              </div>
            )}

            {bestCrop && bestCrop.profit > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-semibold">Most profitable crop{selected ? " this season" : ""}</p>
                  <p className="text-sm font-bold text-amber-900">
                    {cropEmoji(bestCrop.crop)} {bestCrop.crop} — {signedFmt(bestCrop.profit)} over {bestCrop.cycles} harvest{bestCrop.cycles > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Crop-wise table */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Wheat size={15} className="text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-800">Crop-wise P&amp;L</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Crop", "Field", "Season", "Yield", "Expenses", "Revenue", "Profit", "Per area"].map(h => (
                        <th key={h} className={`text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap ${["Expenses", "Revenue", "Profit", "Per area", "Yield"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.cycleId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/farms/${farmId}/crop-cycles/${r.cycleId}`} className="font-medium text-gray-800 text-xs hover:text-primary-700">
                            {cropEmoji(r.crop?.name)} {r.crop?.name}
                          </Link>
                          <span className={`ml-2 ${CYCLE_STATUS[r.status].badge}`}>{CYCLE_STATUS[r.status].label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.field?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.season}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600 whitespace-nowrap tabular-nums">{r.actualYield > 0 ? `${r.actualYield} ${unitLabel(r.yieldUnit)}` : "—"}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-700 tabular-nums">{fmt(r.expenses)}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-700 tabular-nums">{r.revenue > 0 ? fmt(r.revenue) : "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={`text-xs font-bold ${r.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>{signedFmt(r.profit)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600 whitespace-nowrap tabular-nums">
                          {r.profitPerArea !== null && r.field && DONE.includes(r.status) ? `${signedFmt(r.profitPerArea)}/${areaUnitShort(r.field.areaUnit)}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-600">Total · {rows.length} crop{rows.length > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-gray-800 tabular-nums">{fmt(totals.expenses)}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-gray-800 tabular-nums">{fmt(totals.revenue)}</td>
                      <td className={`px-4 py-3 text-right text-xs font-bold tabular-nums ${totals.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>{signedFmt(totals.profit)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Profit by crop</h3>
                <BarList items={crops.map(c => ({
                  label: `${cropEmoji(c.crop)} ${c.crop}`,
                  sub: `${c.cycles} crop${c.cycles > 1 ? "s" : ""}`,
                  value: c.profit,
                  display: signedFmt(c.profit),
                }))} />
              </div>

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Expenses by category</h3>
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No expenses recorded</p>
                ) : (
                  <BarList color={CHART.loss} items={categories.map(([cat, amount]) => ({
                    label: categoryLabel(cat),
                    value: amount,
                    display: `${fmt(amount)} · ${Math.round((amount / totals.expenses) * 100)}%`,
                  }))} />
                )}
              </div>
            </div>

            {fields.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Award size={15} className="text-primary-600" /> Field performance
                </h3>
                <p className="text-xs text-gray-400 mb-4">Profit per unit of area from harvested crops</p>
                <BarList items={fields.map(f => ({
                  label: f.name,
                  sub: `${f.area} ${f.unit} · ${f.crops} harvest${f.crops > 1 ? "s" : ""}`,
                  value: f.perArea,
                  display: `${signedFmt(f.perArea)}/${f.unit}`,
                }))} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
