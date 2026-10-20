import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { ChevronDown } from "lucide-react";

const STEPS = [
  { key: "farm", emoji: "🏡" },
  { key: "fields", emoji: "🗺️" },
  { key: "plant", emoji: "🌱" },
  { key: "expenses", emoji: "💰" },
  { key: "harvest", emoji: "🌾" },
  { key: "profit", emoji: "📊" },
] as const;

const FAQS = [
  "seasonYear", "expenseCrop", "finalHarvest", "sellParts", "negativeProfit",
  "closeSeason", "nextCrop", "deletes", "areaUnits", "passwordLogout", "language",
] as const;

export default async function HelpPage() {
  const [t, tc] = await Promise.all([getTranslations("help"), getTranslations("common")]);
  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6 max-w-2xl space-y-6">
        <BackLink href="/settings" label={tc("backToSettings")} />

        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("howItWorks")}</h2>
          <ol className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((s, i) => (
              <li key={s.key} className="card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-lg flex-shrink-0">{s.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800"><span className="text-primary-600">{i + 1}.</span> {t(`steps.${s.key}.title`)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`steps.${s.key}.text`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">{t("faqTitle")}</h2>
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {FAQS.map(key => (
              <details key={key} className="group">
                <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium text-gray-700">{t(`faqs.${key}.q`)}</span>
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 -mt-1 text-sm text-gray-500 leading-relaxed">{t(`faqs.${key}.a`)}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
