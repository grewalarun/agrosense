import Link from "next/link";
import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";
import { CalendarDays, CheckCircle2 } from "lucide-react";

// Placeholder until planning (tasks, reminders, season calendar) is built
export default async function PlanningPage() {
  const t = await getTranslations("planning");
  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6">
        <div className="card p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto">
            <CalendarDays size={26} className="text-primary-600" />
          </div>
          <span className="badge-yellow">{t("comingSoon")}</span>
          <h2 className="text-lg font-bold text-gray-800">{t("heading")}</h2>
          <p className="text-sm text-gray-500">{t("text")}</p>
          <ul className="text-left space-y-2 bg-gray-50 rounded-xl p-4">
            {(["point1", "point2", "point3"] as const).map(key => (
              <li key={key} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={15} className="text-primary-500 mt-0.5 flex-shrink-0" /> {t(key)}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400">{t("meanwhile")}</p>
          <Link href="/dashboard" className="btn-primary inline-flex">{t("goDashboard")}</Link>
        </div>
      </main>
    </div>
  );
}
