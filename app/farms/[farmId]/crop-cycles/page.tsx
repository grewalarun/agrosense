import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, Calendar, ChevronRight } from "lucide-react";
import { getCycleRows } from "@/lib/api/cycles";
import { cropEmoji } from "@/lib/crops";
import { CYCLE_STATUS, fmt, formatDate, signedFmt, unitLabel } from "@/lib/format";
import type { CycleStatus } from "@/lib/types";

const FILTERS: (CycleStatus | "ALL")[] = ["ALL", "ACTIVE", "PLANNED", "HARVESTED", "CLOSED"];

export default async function CropCyclesPage(props: PageProps<"/farms/[farmId]/crop-cycles">) {
  const { farmId } = await props.params;
  const { status } = await props.searchParams;
  const filter = FILTERS.find(f => f === status) ?? "ALL";

  const { cycles } = await getCycleRows(farmId);
  const shown = filter === "ALL" ? cycles : cycles.filter(c => c.status === filter);

  return (
    <div>
      <TopBar title="Crop Cycles" />
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{cycles.length} crop cycle{cycles.length !== 1 ? "s" : ""}</p>
          <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Add Crop
          </Link>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <Link key={f} href={f === "ALL" ? `/farms/${farmId}/crop-cycles` : `/farms/${farmId}/crop-cycles?status=${f}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border whitespace-nowrap transition-colors ${f === filter ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-200 text-gray-500 hover:border-primary-300"}`}>
              {f === "ALL" ? "All" : `${CYCLE_STATUS[f].label} (${cycles.filter(c => c.status === f).length})`}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {shown.map(cc => {
            const status = CYCLE_STATUS[cc.status];
            const done = cc.status === "HARVESTED" || cc.status === "CLOSED";
            return (
              <Link key={cc.cycleId} href={`/farms/${farmId}/crop-cycles/${cc.cycleId}`}
                className="card p-4 flex items-start gap-4 hover:border-primary-200 hover:shadow-sm transition-all block">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {cropEmoji(cc.crop?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-800">{cc.crop?.name}</h4>
                    <span className={status.badge}>{status.label}</span>
                    <span className="text-xs text-gray-400">{cc.season}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {cc.field?.name}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {formatDate(cc.startDate)}</span>
                    {cc.endDate && <span className="text-xs text-gray-400 flex items-center gap-1">→ {formatDate(cc.endDate)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    {done ? (
                      <>
                        <p className={`text-sm font-bold ${cc.profit >= 0 ? "text-primary-600" : "text-red-600"}`}>{signedFmt(cc.profit)}</p>
                        <p className="text-xs text-gray-400">{cc.actualYield} {unitLabel(cc.yieldUnit)} harvested</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">Invested</p>
                        <p className="text-sm font-bold text-gray-700">{fmt(cc.expenses)}</p>
                        {cc.expectedYield ? <p className="text-xs text-gray-400">Target {cc.expectedYield} {unitLabel(cc.yieldUnit)}</p> : null}
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {shown.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {cycles.length === 0 ? "No crop cycles yet" : `No ${CYCLE_STATUS[filter as CycleStatus].label.toLowerCase()} crops`}
            </h3>
            {cycles.length === 0 && (
              <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary inline-flex mt-3"><Plus size={14} className="mr-1.5" /> Add First Crop</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
