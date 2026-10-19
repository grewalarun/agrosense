import TopBar from "@/components/TopBar";
import { FARMS, CROP_CYCLES, getLastClosedCycle, getActiveCycle, getCyclePL, getCycleExpenses, fmt } from "@/lib/data";
import Link from "next/link";
import { TrendingUp, TrendingDown, Sprout, MapPin, ChevronRight, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  // Season stats — closed FY2026 only
  const closedFY26 = CROP_CYCLES.filter(c => c.status === "Harvested" && c.closedYear === 2026);
  const seasonStats = closedFY26.reduce(
    (acc, c) => { const pl = getCyclePL(c.id); return { revenue: acc.revenue + pl.revenue, expenses: acc.expenses + pl.expenses, profit: acc.profit + pl.profit }; },
    { revenue: 0, expenses: 0, profit: 0 }
  );
  const allActive = CROP_CYCLES.filter(c => c.status === "Active");
  const totalInvested = allActive.reduce((a, c) => a + getCyclePL(c.id).expenses, 0);

  return (
    <div>
      <TopBar title="Dashboard" />
      <main className="p-4 lg:p-6 space-y-6">

        {/* Hero */}
        <div className="bg-primary-600 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">FY 2025–26 closed season</p>
            <h2 className="text-lg font-bold mt-0.5">Grewal Farm</h2>
            <p className="text-primary-200 text-xs mt-1">{allActive.length} crops growing now · {allActive.length} fields active</p>
          </div>
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center">
            <Sprout size={28} className="text-accent-300" />
          </div>
        </div>

        {/* Season P&L — closed cycles only */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last closed season · FY 2025–26</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4">
              <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp size={11} className="text-primary-500" />Revenue</p>
              <p className="text-xl font-bold text-primary-600 mt-0.5">{fmt(seasonStats.revenue)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingDown size={11} className="text-red-400" />Expenses</p>
              <p className="text-xl font-bold text-red-500 mt-0.5">{fmt(seasonStats.expenses)}</p>
            </div>
            <div className="card p-4 border-accent-200 bg-accent-50">
              <p className="text-xs text-accent-600 font-medium">Net profit</p>
              <p className="text-xl font-bold text-accent-700 mt-0.5">{fmt(seasonStats.profit)}</p>
            </div>
          </div>
        </div>

        {/* Active investment */}
        {totalInvested > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Currently invested in growing crops</p>
                <p className="text-xs text-amber-600">{allActive.length} crops · harvest pending</p>
              </div>
            </div>
            <p className="text-lg font-bold text-amber-700">{fmt(totalInvested)}</p>
          </div>
        )}

        {/* ── FIELD CARDS ── the core of the dashboard */}
        {FARMS.map(farm => (
          <div key={farm.id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{farm.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {farm.location} · {farm.totalArea} acres</p>
              </div>
              <Link href={`/farms/${farm.id}`} className="text-xs text-primary-600 hover:underline">View farm →</Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {farm.fields.map(field => {
                const lastClosed = getLastClosedCycle(field.id);
                const active = getActiveCycle(field.id);
                const lastPL = lastClosed ? getCyclePL(lastClosed.id) : null;
                const activeExpenses = active ? getCyclePL(active.id).expenses : 0;

                return (
                  <Link key={field.id} href={`/farms/${farm.id}/fields/${field.id}`}
                    className="card p-4 hover:border-primary-200 hover:shadow-sm transition-all block">

                    {/* Field header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{field.name}</p>
                        <p className="text-xs text-gray-400">{field.area}Ac · {field.soil} · {field.irrigation}</p>
                      </div>
                      <ChevronRight size={15} className="text-gray-300" />
                    </div>

                    {/* 1. Active crop with expense-to-date */}
                    {active ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-amber-800">🌱 {active.crop}</p>
                          <span className="badge-yellow">Active</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-amber-600">Expenses so far</span>
                          <span className="font-bold text-amber-700">-{fmt(activeExpenses)}</span>
                        </div>
                        <p className="text-xs text-amber-500 mt-0.5">Started {active.startDate}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-2 text-center">
                        <p className="text-xs text-gray-400">No active crop · <span className="text-primary-500">Plant one</span></p>
                      </div>
                    )}

                    {/* 2. Last cycle P&L */}
                    {lastClosed && lastPL ? (
                      <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-400 mb-1">Last cycle · {lastClosed.crop}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-xs">
                            <span className="text-red-400">-{fmt(lastPL.expenses)}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-primary-500">+{fmt(lastPL.revenue)}</span>
                          </div>
                          <span className={`text-sm font-bold ${lastPL.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>
                            {lastPL.profit >= 0 ? "+" : ""}{fmt(lastPL.profit)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{lastClosed.endDate}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                        <p className="text-xs text-gray-400">No closed cycles yet</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Tasks */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Upcoming tasks</h3>
          <div className="space-y-2">
            {[
              { icon: AlertCircle, c: "text-red-500",     bg: "bg-red-50",     text: "Apply fertilizer – Field 2 (Wheat)",    time: "Today" },
              { icon: Clock,        c: "text-amber-600",   bg: "bg-amber-50",   text: "Irrigation schedule – Field 1 (Potato)", time: "Tomorrow" },
              { icon: CheckCircle2, c: "text-primary-600", bg: "bg-primary-50", text: "Record sugarcane growth measurement",     time: "Oct 10" },
            ].map((t, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${t.bg}`}>
                <t.icon size={15} className={t.c} />
                <span className="text-xs text-gray-700 flex-1">{t.text}</span>
                <span className="badge-yellow">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
