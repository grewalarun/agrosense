import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { getFormatters } from "@/i18n/server";
import LanguagePicker from "./language-picker";

export default async function LanguagePage() {
  const [t, tc, f] = await Promise.all([getTranslations("languagePage"), getTranslations("common"), getFormatters()]);
  const region = [
    { label: t("country"), value: t("countryValue") },
    { label: t("currency"), value: t("currencyValue") },
    { label: t("numberFormat"), value: t("numberFormatValue") },
    { label: t("dateFormat"), value: f.date("2026-10-19") },
    { label: t("areaUnits"), value: t("areaUnitsValue") },
    { label: t("yieldUnits"), value: t("yieldUnitsValue") },
    { label: t("seasons"), value: t("seasonsValue") },
  ];

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-lg space-y-5">
        <BackLink href="/settings" label={tc("backToSettings")} />

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">{t("language")}</p>
          <LanguagePicker />
          <p className="text-xs text-gray-400 px-1 mt-2">{t("savedNote")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">{t("region")}</p>
          <div className="card divide-y divide-gray-50">
            {region.map(r => (
              <div key={r.label} className="flex justify-between gap-4 p-4">
                <span className="text-sm text-gray-500 whitespace-nowrap">{r.label}</span>
                <span className="text-sm font-medium text-gray-700 text-right">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
