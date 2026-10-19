import Link from "next/link";
import TopBar from "@/components/TopBar";
import AIEstimatePanel from "@/components/AIEstimatePanel";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Plus, Wheat, BarChart2 } from "lucide-react";
import { getFarm, getFieldDetail } from "@/lib/api/farms";
import { categoryLabel, daysUntil, fmt, formatArea, formatDate, formatLocation, signedFmt } from "@/lib/format";
import type { CycleRow, Expense, Sale } from "@/lib/types";

const COMPLETED = ["HARVESTED", "CLOSED"];

// Completed crops grouped by season, newest season first
function groupBySeason(cycles: CycleRow[]) {
  const groups = new Map<string, CycleRow[]>();
  for (const cycle of cycles.filter(c => COMPLETED.includes(c.status))) {
    groups.set(cycle.season, [...(groups.get(cycle.season) ?? []), cycle]);
  }
  return [...groups.entries()]
    .map(([season, rows]) => ({
      season,
      rows,
      latestStart: Math.max(...rows.map(r => new Date(r.startDate).getTime())),
      expenses: rows.reduce((sum, r) => sum + r.expenses, 0),
      revenue: rows.reduce((sum, r) => sum + r.revenue, 0),
      profit: rows.reduce((sum, r) => sum + r.profit, 0),
    }))
    .sort((a, b) => b.latestStart - a.latestStart);
}

function groupByDate(expenses: Expense[]) {
  const byDate = new Map<string, Expense[]>();
  for (const expense of expenses) {
    byDate.set(expense.date, [...(byDate.get(expense.date) ?? []), expense]);
  }
  return [...byDate.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default async function FieldPage(props: PageProps<"/farms/[farmId]/fields/[fieldId]">) {
  const { farmId, fieldId } = await props.params;
  const [{ field, activeCycle, activeExpenses, sales, report }, farm] = await Promise.all([
    getFieldDetail(farmId, fieldId),
    getFarm(farmId),
  ]);

  const seasons = groupBySeason(report.cycles);
  const planned = report.cycles.filter(c => c.status === "PLANNED");
  const salesByCycle = sales.reduce<Record<string, Sale[]>>((acc, sale) => {
    (acc[sale.cycleId] ??= []).push(sale);
    return acc;
  }, {});
  const maxProfit = Math.max(...seasons.map(s => Math.abs(s.profit)), 1);
  const yieldUnit = activeCycle?.yieldUnit ?? "";
  // Due within a week (or overdue), based on the expected harvest date entered when planting
  const daysToHarvest = activeCycle?.expectedHarvestDate ? daysUntil(activeCycle.expectedHarvestDate) : null;
  const harvestDue = daysToHarvest !== null && daysToHarvest <= 7;

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
            <p className="text-xs text-gray-400">
              {[farm.name, formatArea(field.area, field.areaUnit), field.soilType, field.irrigationType].filter(Boolean).join(" · ")}
            </p>
            {harvestDue && activeCycle && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-amber-700">
                  Ready to Harvest · {formatDate(activeCycle.expectedHarvestDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTIVE CROP SECTION ── */}
        {activeCycle ? (
          <div>
            {/* Financial Summary Bar */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                  <TrendingDown size={10} className="text-red-400" /> Invested
                </p>
                <p className="text-base font-bold text-red-600 mt-0.5">{fmt(activeCycle.expenses)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                  <TrendingUp size={10} className="text-gray-300" /> Revenue
                </p>
                {activeCycle.revenue > 0
                  ? <p className="text-base font-bold text-primary-600 mt-0.5">{fmt(activeCycle.revenue)}</p>
                  : <p className="text-sm font-bold text-gray-300 mt-0.5">Pending</p>}
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Net so far</p>
                <p className={`text-sm font-bold mt-0.5 ${activeCycle.profit >= 0 ? "text-primary-600" : "text-red-500"}`}>
                  {signedFmt(activeCycle.profit)}
                </p>
              </div>
            </div>

            {/* Section header with action buttons */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                Active crop
              </h3>
              <div className="flex gap-2">
                <Link href={`/farms/${farmId}/expenses/add?fieldId=${fieldId}&cycleId=${activeCycle.cycleId}`}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Plus size={12} /> Add expense
                </Link>
                <Link href={`/farms/${farmId}/fields/${fieldId}/harvest?cycleId=${activeCycle.cycleId}`}
                  className={`text-xs py-1.5 px-3 flex items-center gap-1 ${harvestDue
                    ? "bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                    : "btn-primary"}`}>
                  <Wheat size={12} /> {harvestDue ? "⚡ Harvest Now" : "Harvest & Sell"}
                </Link>
              </div>
            </div>

            {/* Two-panel layout: left = expenses, right = AI */}
            <div className="grid lg:grid-cols-2 gap-4">

              {/* LEFT: Active cycle detail */}
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🌱</div>
                  <div className="flex-1">
                    <Link href={`/farms/${farmId}/crop-cycles/${activeCycle.cycleId}`} className="font-semibold text-gray-800 hover:text-primary-700">
                      {activeCycle.crop?.name}{activeCycle.variety && <span className="text-xs font-normal text-gray-400"> · {activeCycle.variety}</span>}
                    </Link>
                    <p className="text-xs text-gray-400">Started {formatDate(activeCycle.startDate)} · {activeCycle.season}</p>
                  </div>
                  <span className="badge-yellow">Active</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-red-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Invested</p>
                    <p className="text-base font-bold text-red-600">{fmt(activeCycle.expenses)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Harvested</p>
                    <p className="text-sm font-bold text-gray-600">{activeCycle.actualYield > 0 ? `${activeCycle.actualYield} ${yieldUnit}` : "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-400">Target</p>
                    <p className="text-sm font-bold text-gray-600">{activeCycle.expectedYield ? `${activeCycle.expectedYield} ${yieldUnit}` : "—"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500">Expense log</p>
                  <Link href={`/farms/${farmId}/expenses/add?fieldId=${fieldId}&cycleId=${activeCycle.cycleId}`}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                    <Plus size={11} /> Add
                  </Link>
                </div>

                {activeExpenses.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">No expenses recorded yet</div>
                ) : (
                  <div>
                    {groupByDate(activeExpenses).map(([date, items]) => (
                      <div key={date}>
                        <p className="text-xs text-gray-400 font-medium py-1.5 border-b border-gray-100">{formatDate(date)}</p>
                        {items.map(e => (
                          <div key={e._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{e.description || categoryLabel(e.category)}</p>
                              <span className="text-xs text-gray-400">{categoryLabel(e.category)}</span>
                            </div>
                            <span className="text-xs font-semibold text-red-500 ml-3 flex-shrink-0">-{fmt(e.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 text-xs font-bold border-t border-gray-200 mt-1">
                      <span className="text-gray-600">Total spent</span>
                      <span className="text-red-600">-{fmt(activeCycle.expenses)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: AI Panel */}
              <AIEstimatePanel input={{
                crop: activeCycle.crop?.name ?? "",
                fieldName: field.name,
                area: formatArea(field.area, field.areaUnit, true),
                soil: field.soilType,
                irrigation: field.irrigationType,
                startDate: activeCycle.startDate.slice(0, 10),
                season: activeCycle.season,
                location: formatLocation(farm.location),
                expectedYield: activeCycle.expectedYield,
                yieldUnit,
                expenses: activeCycle.expenses,
              }} />
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center border-dashed border-2 border-gray-200">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No active crop</p>
            <p className="text-xs text-gray-400 mb-4">Plant a crop to start tracking expenses and get AI yield estimates</p>
            <Link href={`/farms/${farmId}/crop-cycles/add?fieldId=${fieldId}`} className="btn-primary inline-flex items-center gap-1.5">
              <Plus size={14} /> Plant a crop
            </Link>
          </div>
        )}

        {planned.length > 0 && (
          <div className="card p-3 text-xs text-gray-500">
            Planned next: {planned.map(c => `${c.crop?.name} (${c.season})`).join(", ")}
          </div>
        )}

        {/* ── P&L HISTORY BY SEASON ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <BarChart2 size={15} className="text-primary-500" /> P&L history
            </h3>
            <span className="text-xs text-gray-400">Harvested crops · by season</span>
          </div>

          {seasons.length > 0 && (
            <div className="card p-4 mb-4">
              <div className="flex items-end gap-2 h-20">
                {seasons.slice(0, 4).reverse().map(s => (
                  <div key={s.season} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                    <p className={`text-xs font-semibold ${s.profit >= 0 ? "text-primary-600" : "text-red-500"}`}>{signedFmt(s.profit)}</p>
                    <div className={`w-full rounded-t-md ${s.profit >= 0 ? "bg-primary-400" : "bg-red-400"}`}
                      style={{ height: `${Math.max(8, (Math.abs(s.profit) / maxProfit) * 100)}%` }} />
                    <p className="text-xs text-gray-400 whitespace-nowrap">{s.season}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seasons.length === 0 ? (
            <div className="card p-6 text-center text-xs text-gray-400">No harvested crops yet</div>
          ) : (
            <div className="space-y-3">
              {seasons.map((s, idx) => (
                <div key={s.season} className="card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="badge-yellow">Latest</span>}
                      <p className="font-bold text-gray-800 text-sm">{s.season}</p>
                      <span className="text-xs text-gray-400">{s.rows.length} crop{s.rows.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-red-400 hidden sm:inline">-{fmt(s.expenses)}</span>
                      <span className="text-primary-500 hidden sm:inline">+{fmt(s.revenue)}</span>
                      <span className={`font-bold text-sm ${s.profit >= 0 ? "text-primary-600" : "text-red-600"}`}>{signedFmt(s.profit)}</span>
                    </div>
                  </div>

                  {s.rows.map(cycle => (
                    <div key={cycle.cycleId} className="border-b border-gray-50 last:border-0">
                      <Link href={`/farms/${farmId}/crop-cycles/${cycle.cycleId}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary-50/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🌾</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{cycle.crop?.name}</p>
                            <p className="text-xs text-gray-400">{formatDate(cycle.startDate)} → {formatDate(cycle.endDate) || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-400">-{fmt(cycle.expenses)} exp</p>
                            <p className="text-xs text-gray-400">+{fmt(cycle.revenue)} rev</p>
                          </div>
                          <p className={`text-sm font-bold ${cycle.profit >= 0 ? "text-primary-600" : "text-red-500"}`}>{signedFmt(cycle.profit)}</p>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </Link>

                      {salesByCycle[cycle.cycleId]?.length > 0 && (
                        <div className="px-4 pb-3 bg-primary-50/20">
                          <p className="text-xs text-gray-400 mb-1.5 font-medium">Sale transactions</p>
                          <div className="space-y-1">
                            {salesByCycle[cycle.cycleId].map(sale => (
                              <div key={sale._id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {formatDate(sale.date)} · {sale.quantity} {sale.unit} @ {fmt(sale.pricePerUnit)}/{sale.unit}
                                  {sale.buyer && ` · ${sale.buyer}`}
                                </span>
                                <span className="font-semibold text-primary-600">+{fmt(sale.totalAmount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
