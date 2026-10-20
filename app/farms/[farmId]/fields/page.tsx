import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, Droplets, ChevronRight } from "lucide-react";
import { getFarmReport } from "@/lib/api/farms";
import { getTranslations } from "next-intl/server";
import { fmt } from "@/lib/format";
import { getFormatters } from "@/i18n/server";

export default async function FieldsPage(props: PageProps<"/farms/[farmId]/fields">) {
  const { farmId } = await props.params;
  const [{ farm, fields }, t, f] = await Promise.all([getFarmReport(farmId), getTranslations("fields"), getFormatters()]);

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {t("countWithArea", { count: fields.length, area: f.area(farm.totalArea, farm.areaUnit, true) })}
          </p>
          <Link href={`/farms/${farmId}/fields/add`} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> {t("addField")}
          </Link>
        </div>
        <div className="space-y-3">
          {fields.map(({ field, activeCycle, lastCompletedCycle }) => (
            <Link key={field._id} href={`/farms/${farmId}/fields/${field._id}`}
              className="card p-4 flex items-start gap-4 hover:border-primary-200 hover:shadow-sm transition-all block">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${activeCycle ? "bg-primary-100" : "bg-gray-100"}`}>
                {activeCycle ? "🌱" : "⬜"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">{field.name}</p>
                  <span className={activeCycle ? "badge-active" : "badge-empty"}>{activeCycle ? t("active") : t("empty")}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {f.area(field.area, field.areaUnit)}
                  {field.soilType && <> · {f.soil(field.soilType)}</>}
                  {field.irrigationType && <> · <Droplets size={10} className="inline" /> {f.irrigation(field.irrigationType)}</>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeCycle && (
                    <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                      🌱 {f.crop(activeCycle.crop?.name)} · {t("invested", { amount: fmt(activeCycle.expenses) })}
                    </span>
                  )}
                  {lastCompletedCycle && (
                    <span className="text-xs bg-primary-50 border border-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      {t("lastCrop", { crop: f.crop(lastCompletedCycle.crop?.name) })} · {t(lastCompletedCycle.profit >= 0 ? "profit" : "loss", { amount: `${lastCompletedCycle.profit < 0 ? "-" : ""}${fmt(lastCompletedCycle.profit)}` })}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
            </Link>
          ))}
          <Link href={`/farms/${farmId}/fields/add`}
            className="card p-4 border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-primary-600 h-16">
            <Plus size={18} /><span className="text-sm font-medium">{t("addNewField")}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
