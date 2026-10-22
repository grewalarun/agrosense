import { getTranslations } from "next-intl/server";
import { Users, UserPlus, Activity, Sprout, RefreshCw, DollarSign, ShoppingCart, Wheat } from "lucide-react";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import BarList, { type BarItem } from "@/components/charts/BarList";
import LineChart from "@/components/charts/LineChart";
import { SERIES } from "@/components/charts/colors";
import FilterChips from "@/components/admin/FilterChips";
import { getAdminDashboard, parsePlatform, parseRange, RANGES } from "@/lib/api/admin";
import { getFormatters } from "@/i18n/server";
import { LOCALE_NAMES, isLocale } from "@/i18n/config";
import type { AdminBreakdownRow, CycleStatus } from "@/lib/types";

const num = (n: number) => n.toLocaleString("en-IN");

export default async function AdminAnalyticsPage(props: { searchParams: Promise<{ range?: string; platform?: string }> }) {
  const sp = await props.searchParams;
  const days = parseRange(sp.range);
  const platform = parsePlatform(sp.platform);
  const [data, t, f] = await Promise.all([getAdminDashboard(days, platform), getTranslations("admin"), getFormatters()]);
  const { overview, signups, activity, breakdowns, platforms } = data;
  const dayLabel = (date: string) => f.date(`${date}T00:00:00Z`);
  const href = (range: number, p?: string) => `/admin?range=${range}${p ? `&platform=${p}` : ""}`;

  const bars = (rows: AdminBreakdownRow[], label: (l: string) => string = (l) => l): BarItem[] =>
    rows.map((r) => ({ label: label(r.label), value: r.count, display: num(r.count) }));
  const language = (code: string) => (isLocale(code) ? LOCALE_NAMES[code].native : code);
  const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

  const mobileUsers = platforms.users.android + platforms.users.ios;
  const harvested = overview.harvests.map((h) => `${num(h.quantity)} ${f.unit(h.unit)}`).join(", ") || "0";
  const activeCycles = overview.cyclesByStatus.ACTIVE ?? 0;

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 space-y-5 max-w-6xl">
        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-between">
          <FilterChips chips={RANGES.map((r) => ({ label: t("lastDays", { days: r }), href: href(r, platform), active: r === days }))} />
          <FilterChips chips={[
            { label: t("platformAll"), href: href(days), active: !platform },
            { label: t("web"), href: href(days, "web"), active: platform === "web" },
            { label: t("android"), href: href(days, "android"), active: platform === "android", disabled: platforms.users.android === 0, title: t("mobileSoon") },
            { label: t("ios"), href: href(days, "ios"), active: platform === "ios", disabled: platforms.users.ios === 0, title: t("mobileSoon") },
          ]} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label={t("totalUsers")} value={num(overview.users.total)} icon={Users}
            sub={overview.users.disabled ? `${num(overview.users.disabled)} ${t("disabled").toLowerCase()}` : undefined} />
          <StatCard label={t("newUsers")} value={num(overview.users.new)} icon={UserPlus} sub={t("lastDays", { days })} />
          <StatCard label={t("activeUsers")} value={num(overview.users.active)} icon={Activity} sub={t("lastDays", { days })} />
          <StatCard label={t("farms")} value={num(overview.farms)} icon={Sprout} sub={`${num(overview.fields)} ${t("fields").toLowerCase()}`} />
          <StatCard label={t("activeCycles")} value={num(activeCycles)} icon={RefreshCw}
            sub={Object.entries(overview.cyclesByStatus).map(([s, n]) => `${num(n)} ${f.status(s as CycleStatus).toLowerCase()}`).join(" · ")} />
          <StatCard label={t("expenses")} value={f.money(overview.expenses.amount)} icon={DollarSign}
            sub={t("records", { count: num(overview.expenses.count) })} />
          <StatCard label={t("harvested")} value={harvested} icon={Wheat} sub={t("lastDays", { days })} />
          <StatCard label={t("salesRevenue")} value={f.money(overview.sales.revenue)} icon={ShoppingCart}
            sub={t("records", { count: num(overview.sales.count) })} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("signupsTitle")}</h2>
            <LineChart dates={signups.days.map((d) => d.date)} formatDate={dayLabel} series={[
              { label: t("signupsTotal"), color: SERIES[0], values: signups.days.map((d) => d.total) },
              { label: t("signupsGoogle"), color: SERIES[1], values: signups.days.map((d) => d.google) },
            ]} />
          </section>
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("activityTitle")}</h2>
            <LineChart dates={activity.days.map((d) => d.date)} formatDate={dayLabel} series={[
              { label: t("seriesExpenses"), color: SERIES[0], values: activity.days.map((d) => d.expenses) },
              { label: t("seriesHarvests"), color: SERIES[1], values: activity.days.map((d) => d.harvests) },
              { label: t("seriesSales"), color: SERIES[2], values: activity.days.map((d) => d.sales) },
            ]} />
          </section>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Breakdown title={t("topCrops")} empty={t("noData")} items={bars(breakdowns.crops, (l) => f.crop(titleCase(l)))} />
          <Breakdown title={t("seasons")} empty={t("noData")} items={bars(breakdowns.seasons, (l) => f.seasonType(l as "RABI"))} />
          <Breakdown title={t("languages")} empty={t("noData")} items={bars(breakdowns.languages, language)} />
          <Breakdown title={t("states")} empty={t("noData")} items={bars(breakdowns.states, titleCase)} />
        </div>

        <section className="card p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("platformsTitle")}</h2>
          <BarList color={SERIES[0]} items={[
            { label: t("web"), value: platforms.users.web, display: num(platforms.users.web) },
            { label: t("android"), value: platforms.users.android, display: num(platforms.users.android) },
            { label: t("ios"), value: platforms.users.ios, display: num(platforms.users.ios) },
          ]} />
          {mobileUsers > 0 && platforms.appVersions.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              {t("appVersions")}: {platforms.appVersions.map((v) => `${v.platform} ${v.version} (${v.count})`).join(", ")}
            </p>
          )}
        </section>

        <p className="text-xs text-gray-400">{t("privacyNote")}</p>
      </main>
    </div>
  );
}

function Breakdown({ title, items, empty }: { title: string; items: BarItem[]; empty: string }) {
  return (
    <section className="card p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
      {items.length ? <BarList items={items} color={SERIES[0]} /> : <p className="text-sm text-gray-400">{empty}</p>}
    </section>
  );
}
