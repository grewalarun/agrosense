import Link from "next/link";
import TopBar from "@/components/TopBar";
import ProfitColumns from "@/components/charts/ProfitColumns";
import { TrendingUp, TrendingDown, Sprout, MapPin, ChevronRight, AlertCircle, Clock, PackageOpen, Play } from "lucide-react";
import { getUser } from "@/lib/dal";
import { getFarmCards, getFarmReport } from "@/lib/api/farms";
import { getAllCycleRows, getSeasons } from "@/lib/api/reports";
import { cropEmoji } from "@/lib/crops";
import { getTranslations } from "next-intl/server";
import { daysUntil, fmt, formatLocation, signedFmt } from "@/lib/format";
import { getFormatters } from "@/i18n/server";
import type { Formatters } from "@/i18n/format";
import type { CycleRow } from "@/lib/types";

type Task = { key: string; href: string; text: string; when: string; tone: "red" | "amber" | "green"; Icon: typeof AlertCircle };

// Real to-dos from the data: harvests due, unsold stock, planned crops past their start date
type TaskT = (key: string, values?: Record<string, string | number>) => string;

function buildTasks(rows: CycleRow[], t: TaskT, f: Formatters): Task[] {
  const tasks: Task[] = [];
  for (const r of rows) {
    if (!r.field) continue;
    const crop = f.crop(r.crop?.name ?? "Crop");
    const base = `/farms/${r.farmId}`;
    if (r.status === "ACTIVE" && r.expectedHarvestDate) {
      const days = daysUntil(r.expectedHarvestDate);
      if (days <= 7) {
        tasks.push({
          key: `harvest-${r.cycleId}`,
          href: `${base}/fields/${r.field._id}/harvest?cycleId=${r.cycleId}`,
          text: t("harvest", { crop, field: r.field.name }),
          when: days < 0 ? t("overdue", { days: -days }) : days === 0 ? t("today") : t("inDays", { days }),
          tone: days < 0 ? "red" : "amber",
          Icon: AlertCircle,
        });
      }
    }
    const unsold = Object.entries(r.harvested).filter(([, h]) => h.remaining > 0);
    if (r.status !== "CLOSED" && unsold.length > 0) {
      tasks.push({
        key: `sell-${r.cycleId}`,
        href: `${base}/fields/${r.field._id}/harvest?cycleId=${r.cycleId}&sell=1`,
        text: t("sell", { qty: unsold.map(([unit, h]) => `${h.remaining} ${f.unit(unit)}`).join(" + "), crop, field: r.field.name }),
        when: t("unsold"),
        tone: "amber",
        Icon: PackageOpen,
      });
    }
    if (r.status === "PLANNED" && daysUntil(r.startDate) <= 0) {
      tasks.push({
        key: `start-${r.cycleId}`,
        href: `${base}/crop-cycles/${r.cycleId}`,
        text: t("start", { crop, field: r.field.name }),
        when: f.date(r.startDate),
        tone: "green",
        Icon: Play,
      });
    }
  }
  return tasks;
}

const TONE = {
  red: { bg: "bg-red-50", icon: "text-red-500" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  green: { bg: "bg-primary-50", icon: "text-primary-600" },
};

export default async function DashboardPage() {
  const [user, { farms }, t, f] = await Promise.all([getUser(), getFarmCards(), getTranslations("dashboard"), getFormatters()]);

  if (farms.length === 0) {
    return (
      <div>
        <TopBar title={t("title")} />
        <main className="p-4 lg:p-6">
          <div className="card p-8 text-center max-w-md mx-auto">
            <div className="text-5xl mb-3">🌾</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{user ? t("welcomeName", { name: user.name }) : t("welcome")}</h2>
            <p className="text-sm text-gray-500 mb-5">{t("welcomeText")}</p>
            <Link href="/onboarding" className="btn-primary inline-flex">{t("setUp")}</Link>
          </div>
        </main>
      </div>
    );
  }

  const [{ seasons }, { cycles }, farmReports] = await Promise.all([
    getSeasons(),
    getAllCycleRows(),
    Promise.all(farms.map(f => getFarmReport(f.farm._id))),
  ]);

  const growing = cycles.filter(c => c.status === "ACTIVE");
  const invested = farms.reduce((sum, f) => sum + f.activeInvestment, 0);
  const fieldCount = farms.reduce((sum, f) => sum + f.fieldCount, 0);
  // The latest season with sales is the most recent one with a meaningful result
  const latest = seasons.find(s => s.revenue > 0);
  const tasks = buildTasks(cycles, (await getTranslations("dashboard.tasks")) as unknown as TaskT, f);
  const emptyFields = farmReports.flatMap(r =>
    r.fields.filter(f => !f.activeCycle && f.plannedCycles.length === 0).map(f => ({ farmId: r.farm._id, field: f.field }))
  );
  const seasonPoints = [...seasons].reverse().slice(-6).map(s => ({ label: f.season(s.seasonType, s.seasonYear), profit: s.profit, revenue: s.revenue, expenses: s.expenses }));

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 space-y-6">

        {/* Hero */}
        <div className="bg-primary-600 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{user ? t("greetingName", { name: user.name }) : t("greeting")}</p>
            <h2 className="text-lg font-bold mt-0.5">{farms.length === 1 ? farms[0].farm.name : t("farmsCount", { count: farms.length })}</h2>
            <p className="text-primary-100 text-xs mt-1">
              {t("heroLine", { crops: growing.length, fields: fieldCount })}
            </p>
          </div>
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center">
            <Sprout size={28} className="text-accent-300" />
          </div>
        </div>

        {/* Latest season P&L */}
        {latest && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("latestSeason", { season: f.season(latest.seasonType, latest.seasonYear) })}</p>
            {/* On phones the profit gets its own row: three amounts don't fit side by side */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp size={11} className="text-primary-500" />{t("revenue")}</p>
                <p className="text-lg sm:text-xl font-bold whitespace-nowrap tabular-nums text-gray-800 mt-0.5">{fmt(latest.revenue)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingDown size={11} className="text-red-400" />{t("expenses")}</p>
                <p className="text-lg sm:text-xl font-bold whitespace-nowrap tabular-nums text-gray-800 mt-0.5">{fmt(latest.expenses)}</p>
              </div>
              <div className="card p-4 border-accent-200 bg-accent-50 col-span-2 sm:col-span-1">
                <p className="text-xs text-accent-700 font-medium">{t("netProfit")}</p>
                <p className={`text-lg sm:text-xl font-bold whitespace-nowrap tabular-nums mt-0.5 ${latest.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>{signedFmt(latest.profit)}</p>
              </div>
            </div>
          </div>
        )}

        {invested > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{t("investedTitle")}</p>
                <p className="text-xs text-amber-700">{t("investedLine", { count: growing.length })}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-amber-700">{fmt(invested)}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Needs attention */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("needsAttention")}</h3>
            {tasks.length === 0 && emptyFields.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">{t("allCaughtUp")}</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(t => (
                  <Link key={t.key} href={t.href} className={`flex items-center gap-3 p-2.5 rounded-lg ${TONE[t.tone].bg} hover:brightness-95`}>
                    <t.Icon size={15} className={TONE[t.tone].icon} />
                    <span className="text-xs text-gray-700 flex-1">{t.text}</span>
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{t.when}</span>
                  </Link>
                ))}
                {emptyFields.map(({ farmId, field }) => (
                  <Link key={field._id} href={`/farms/${farmId}/crop-cycles/add?fieldId=${field._id}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <Sprout size={15} className="text-gray-400" />
                    <span className="text-xs text-gray-700 flex-1">{t("fieldEmpty", { field: field.name })}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profit by season */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("profitBySeason")}</h3>
            {seasonPoints.length > 0
              ? <ProfitColumns points={seasonPoints} />
              : <p className="text-xs text-gray-400 py-4 text-center">{t("noCrops")}</p>}
          </div>
        </div>

        {/* ── FIELD CARDS per farm ── */}
        {farmReports.map(({ farm, fields }) => (
          <div key={farm._id}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{farm.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {[formatLocation(farm.location), f.area(farm.totalArea, farm.areaUnit, true)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Link href={`/farms/${farm._id}`} className="text-xs text-primary-600 hover:underline">{t("viewFarm")}</Link>
            </div>

            {fields.length === 0 ? (
              <Link href={`/farms/${farm._id}/fields/add`} className="card p-4 block text-center text-xs text-gray-400 hover:text-primary-600">{t("noFields")}</Link>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {fields.map(({ field, activeCycle, lastCompletedCycle }) => (
                  <Link key={field._id} href={`/farms/${farm._id}/fields/${field._id}`}
                    className="card p-4 hover:border-primary-200 hover:shadow-sm transition-all block">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{field.name}</p>
                        <p className="text-xs text-gray-400">{[f.area(field.area, field.areaUnit), f.soil(field.soilType), f.irrigation(field.irrigationType)].filter(Boolean).join(" · ")}</p>
                      </div>
                      <ChevronRight size={15} className="text-gray-300" />
                    </div>

                    {activeCycle ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-amber-800">{cropEmoji(activeCycle.crop?.name)} {f.crop(activeCycle.crop?.name)}</p>
                          <span className="badge-yellow">{t("active")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-amber-700">{t("expensesSoFar")}</span>
                          <span className="font-bold text-amber-800">-{fmt(activeCycle.expenses)}</span>
                        </div>
                        <p className="text-xs text-amber-600 mt-0.5">{t("started", { date: f.date(activeCycle.startDate) })}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-2 text-center">
                        <p className="text-xs text-gray-400">{t.rich("noActiveCrop", { link: chunks => <span className="text-primary-600">{chunks}</span> })}</p>
                      </div>
                    )}

                    {lastCompletedCycle ? (
                      <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-500 mb-1">{t("lastCrop", { crop: f.crop(lastCompletedCycle.crop?.name), season: f.season(lastCompletedCycle.seasonType, lastCompletedCycle.seasonYear) })}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>-{fmt(lastCompletedCycle.expenses)}</span>
                            <span className="text-gray-300">|</span>
                            <span>+{fmt(lastCompletedCycle.revenue)}</span>
                          </div>
                          <span className={`text-sm font-bold ${lastCompletedCycle.profit >= 0 ? "text-primary-700" : "text-red-600"}`}>
                            {signedFmt(lastCompletedCycle.profit)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                        <p className="text-xs text-gray-400">{t("noHarvested")}</p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
