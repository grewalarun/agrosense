import Link from "next/link";
import TopBar from "@/components/TopBar";
import AIEstimatePanel from "@/components/AIEstimatePanel";
import { ChevronLeft, TrendingUp, TrendingDown, Plus, Wheat, Lock } from "lucide-react";
import { getCycleDetail } from "@/lib/api/cycles";
import { cropEmoji } from "@/lib/crops";
import { CYCLE_STATUS, areaUnitShort, categoryColor, categoryLabel, fmt, formatArea, formatDate, formatLocation, signedFmt, unitLabel } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/types";
import CycleActions from "./cycle-actions";
import { ExpenseRow, SaleRow } from "./entry-rows";

export default async function CropDetailPage(props: PageProps<"/farms/[farmId]/crop-cycles/[cycleId]">) {
  const { farmId, cycleId } = await props.params;
  const { report, cycle, expenses, sales, harvests, farm } = await getCycleDetail(farmId, cycleId);

  const field = cycle.fieldId;
  const cropName = report.crop?.name ?? "Crop";
  const unit = unitLabel(report.yieldUnit);
  const status = CYCLE_STATUS[report.status];
  const isActive = report.status === "ACTIVE";
  const isDone = report.status === "HARVESTED" || report.status === "CLOSED";
  const canAddExpense = report.status !== "CLOSED";
  // Entries stay editable until the season is closed; Reopen unlocks them again
  const editable = report.status !== "CLOSED";
  const remainingByHarvest = new Map(harvests.map(h => [h._id, h.remainingQuantity]));
  const stock = report.harvested[report.yieldUnit]?.remaining ?? 0;
  const byCategory = (Object.entries(report.expensesByCategory) as [ExpenseCategory, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <TopBar title={`${cropName} · ${field.name}`} />
      <main className="p-4 lg:p-6 space-y-5 max-w-2xl">
        <Link href={`/farms/${farmId}/fields/${field._id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ChevronLeft size={16} /> Back to {field.name}
        </Link>

        {/* Cycle header */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">{cropEmoji(cropName)}</div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{cropName}{report.variety && <span className="text-sm font-normal text-gray-400"> · {report.variety}</span>}</h2>
                <p className="text-sm text-gray-500">{[field.name, formatArea(field.area, field.areaUnit, true), field.soilType].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{report.season}</p>
              </div>
            </div>
            <span className={status.badge}>{status.label}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Sown", value: formatDate(report.startDate) },
              { label: isDone ? "Harvested" : "Est. harvest", value: formatDate(isDone ? report.endDate : report.expectedHarvestDate) || "—" },
              { label: "Target yield", value: report.expectedYield ? `${report.expectedYield} ${unit}` : "—" },
              { label: "Actual yield", value: report.actualYield > 0 ? `${report.actualYield} ${unit}` : isActive ? "Growing" : "—" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-bold text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {cycle.notes && <p className="text-xs text-gray-500 mt-3 whitespace-pre-line">{cycle.notes}</p>}
          <div className="flex flex-wrap items-start justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              {canAddExpense && (
                <Link href={`/farms/${farmId}/expenses/add?cycleId=${cycleId}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Plus size={12} /> Add expense
                </Link>
              )}
              {(isActive || (report.status === "HARVESTED" && stock > 0)) && (
                <Link href={`/farms/${farmId}/fields/${field._id}/harvest?cycleId=${cycleId}`} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Wheat size={12} /> {isActive ? "Harvest & Sell" : "Sell stock"}
                </Link>
              )}
            </div>
            <CycleActions farmId={farmId} fieldId={field._id} cycleId={cycleId} status={report.status} cropName={cropName} />
          </div>
        </div>

        {/* ── CROP P&L ── */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{isDone ? "Final P&L" : "P&L in progress"}</h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-center"><TrendingDown size={11} className="text-red-400" />Total expenses</p>
              <p className="text-lg font-bold text-red-600 mt-0.5">{fmt(report.expenses)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${report.revenue > 0 ? "bg-primary-50 border-primary-100" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-center"><TrendingUp size={11} className={report.revenue > 0 ? "text-primary-500" : "text-gray-300"} />Revenue</p>
              <p className={`text-base sm:text-lg font-bold mt-0.5 whitespace-nowrap tabular-nums ${report.revenue > 0 ? "text-primary-600" : "text-gray-300"}`}>
                {report.revenue > 0 ? fmt(report.revenue) : "Pending"}
              </p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${report.profit >= 0 ? "bg-accent-50 border-accent-200" : "bg-red-50 border-red-100"}`}>
              <p className="text-xs text-gray-400">{isDone ? "Net profit" : "Net so far"}</p>
              <p className={`text-base sm:text-lg font-bold mt-0.5 whitespace-nowrap tabular-nums ${report.profit >= 0 ? "text-accent-700" : "text-red-600"}`}>{signedFmt(report.profit)}</p>
              {report.profitPerArea !== null && isDone && (
                <p className="text-xs text-gray-400">{signedFmt(report.profitPerArea)} / {areaUnitShort(field.areaUnit)}</p>
              )}
            </div>
          </div>

          {stock > 0 && (
            <p className="text-xs bg-amber-50 border border-amber-100 text-amber-700 rounded-lg p-2.5 mb-4">
              {stock} {unit} harvested but not sold yet — revenue will rise when it is sold.
            </p>
          )}

          {byCategory.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Expense breakdown</p>
              <div className="space-y-2">
                {byCategory.map(([cat, amt]) => {
                  const pct = Math.round((amt / report.expenses) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor(cat)}`}>{categoryLabel(cat)}</span>
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

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Expense entries ({expenses.length})</p>
                {expenses.map(e => <ExpenseRow key={e._id} expense={e} editable={editable} />)}
              </div>
            </div>
          )}

          {sales.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Revenue breakdown ({sales.length} sale{sales.length > 1 ? "s" : ""})</p>
              <div className="space-y-2">
                {sales.map(sale => (
                  <SaleRow key={sale._id} sale={sale} editable={editable}
                    maxQuantity={Math.round((sale.quantity + (remainingByHarvest.get(sale.harvestId) ?? 0)) * 1000) / 1000} />
                ))}
                <div className="flex justify-between text-sm pt-1 font-bold border-t border-gray-100">
                  <span className="text-gray-600">Total revenue</span>
                  <span className="text-primary-600">+{fmt(report.revenue)}</span>
                </div>
              </div>
            </div>
          )}

          {!editable && (expenses.length > 0 || sales.length > 0) && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-2.5 mt-4 flex items-center gap-1.5">
              <Lock size={12} /> Season closed — use <b>Reopen</b> above to edit or delete entries.
            </p>
          )}

          {expenses.length === 0 && sales.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No expenses or sales recorded yet</p>
          )}
        </div>

        {isActive && (
          <AIEstimatePanel input={{
            crop: cropName,
            fieldName: field.name,
            area: formatArea(field.area, field.areaUnit, true),
            soil: field.soilType,
            irrigation: field.irrigationType,
            startDate: report.startDate.slice(0, 10),
            season: report.season,
            location: formatLocation(farm.location),
            expectedYield: report.expectedYield,
            yieldUnit: report.yieldUnit,
            expenses: report.expenses,
          }} />
        )}
      </main>
    </div>
  );
}
