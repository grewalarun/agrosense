import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Droplets, Layers, MapPin, Plus, ChevronRight } from "lucide-react";
import { getFarmReport } from "@/lib/api/farms";
import { getTranslations } from "next-intl/server";
import { fmt, formatLocation } from "@/lib/format";
import { getFormatters } from "@/i18n/server";

export default async function FarmDetailPage(props: PageProps<"/farms/[farmId]">) {
  const { farmId } = await props.params;
  const [{ farm, fields, activeInvestment, totals }, t, tf, f] = await Promise.all([
    getFarmReport(farmId), getTranslations("farm"), getTranslations("fields"), getFormatters(),
  ]);

  return (
    <div>
      <TopBar title={farm.name} />
      <main className="p-4 lg:p-6 space-y-5">
        {/* Farm info */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌾</span>
            <div>
              <h2 className="font-bold text-gray-800">{farm.name}</h2>
              {formatLocation(farm.location) && (
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {formatLocation(farm.location)}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("totalArea"), value: f.area(farm.totalArea, farm.areaUnit, true) },
              { label: t("irrigation"), value: f.irrigation(farm.irrigationType) || "—", icon: <Droplets size={12} /> },
              { label: t("soilType"), value: f.soil(farm.soilType) || "—", icon: <Layers size={12} /> },
              { label: t("allTimeProfit"), value: `${totals.profit < 0 ? "-" : ""}${fmt(totals.profit)}` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 flex items-center gap-1">{item.icon}{item.label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {activeInvestment > 0 && (
            <p className="text-xs text-amber-600 mt-3">{t("investedGrowing", { amount: fmt(activeInvestment) })}</p>
          )}
        </div>

        {/* Fields with live P&L from cycles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">{tf("title")}</h3>
            <Link href={`/farms/${farmId}/fields/add`} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
              <Plus size={13} /> {tf("addField")}
            </Link>
          </div>
          {fields.length === 0 && (
            <div className="card p-6 text-center text-sm text-gray-400">{tf("noFields")}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map(({ field, activeCycle, lastCompletedCycle }) => (
              <div key={field._id} className="card p-4 hover:border-primary-200 hover:shadow-sm transition-all">
                <Link href={`/farms/${farmId}/fields/${field._id}`} className="block">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${activeCycle ? "bg-primary-100" : "bg-gray-100"}`}>
                        {activeCycle ? "🌱" : "⬜"}
                      </div>
                      <p className="font-medium text-gray-800 text-sm">{field.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={activeCycle ? "badge-active" : "badge-empty"}>{activeCycle ? tf("active") : tf("empty")}</span>
                      <ChevronRight size={13} className="text-gray-300" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {[f.area(field.area, field.areaUnit), f.soil(field.soilType), f.irrigation(field.irrigationType)].filter(Boolean).join(" · ")}
                  </p>
                  {activeCycle && (
                    <p className="text-xs font-semibold text-amber-600 mb-1">🌱 {f.crop(activeCycle.crop?.name)} · {tf("invested", { amount: fmt(activeCycle.expenses) })}</p>
                  )}
                  {lastCompletedCycle && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{tf("lastCropSeason", { crop: f.crop(lastCompletedCycle.crop?.name), season: f.season(lastCompletedCycle.seasonType, lastCompletedCycle.seasonYear) })}</span>
                      <span className={`text-sm font-bold ${lastCompletedCycle.profit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                        {tf(lastCompletedCycle.profit >= 0 ? "profit" : "loss", { amount: `${lastCompletedCycle.profit < 0 ? "-" : ""}${fmt(lastCompletedCycle.profit)}` })}
                      </span>
                    </div>
                  )}
                </Link>
                {!activeCycle && (
                  <Link href={`/farms/${farmId}/crop-cycles/add?fieldId=${field._id}`}
                    className="mt-2 w-full btn-primary py-1.5 text-xs justify-center">
                    {tf("plantCrop")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("quick.cropCycles"), href: `/farms/${farmId}/crop-cycles`, emoji: "🔄" },
            { label: t("quick.expenses"),    href: `/farms/${farmId}/expenses`,    emoji: "💰" },
            { label: t("quick.harvests"),    href: `/farms/${farmId}/harvests`,    emoji: "🌾" },
            { label: t("quick.sales"),       href: `/farms/${farmId}/sales`,       emoji: "🛒" },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="card p-3 hover:border-primary-200 hover:shadow-sm transition-all text-center block">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <p className="text-xs font-medium text-gray-600">{item.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
