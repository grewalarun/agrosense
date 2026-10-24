import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getFormatters } from "@/i18n/server";
import { EXPENSE_CATEGORIES } from "@/lib/format";
import { COMMON_CROPS } from "@/lib/crops";
import type { ExpenseCategory } from "@/lib/types";

// Simplified, app-like screens for the landing page. The numbers are a made-up example
// farm that adds up: Rabi 2025-26 is the finished season, Rabi 2026-27 the current one.
// They are aria-hidden: the text next to each one says the same in words.

const LAST_SEASON = "2025-26";
const THIS_SEASON = "2026-27";
const REPORT = [
  { crop: "Wheat", invested: 5200, earned: 69000 },
  { crop: "Mustard", invested: 7600, earned: 26000 },
  { crop: "Potato", invested: 11800, earned: 7600 },
];
const INVESTED = REPORT.reduce((s, r) => s + r.invested, 0);
const EARNED = REPORT.reduce((s, r) => s + r.earned, 0);
const EXPENSES: { category: ExpenseCategory; key: "seedDesc" | "dapDesc" | "labourDesc"; amount: number; date: string }[] = [
  { category: "SEEDS", key: "seedDesc", amount: 2200, date: "2026-10-15" },
  { category: "FERTILIZER", key: "dapDesc", amount: 2800, date: "2026-10-16" },
  { category: "LABOUR", key: "labourDesc", amount: 1000, date: "2026-10-18" },
];

const emoji = (crop: string) => COMMON_CROPS.find((c) => c.name === crop)?.emoji ?? "🌱";
// Validated profit/loss pair used by the app's reports
const PROFIT = "#16a34a";
const LOSS = "#be185d";

async function load() {
  const [t, f] = await Promise.all([getTranslations("landing.mock"), getFormatters()]);
  return { t, f };
}

// Crop cycle cards: one growing, one harvested
export async function CycleMock() {
  const { t, f } = await load();
  return (
    <div aria-hidden className="space-y-3 select-none">
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl">{emoji("Potato")}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{f.crop("Potato")} · {t("field", { n: 1 })}</p>
            <p className="text-xs text-gray-500">{f.season("RABI", THIS_SEASON)} · 1 {f.areaUnit("ACRE")}</p>
          </div>
          <span className="badge-active">{f.status("ACTIVE")}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-gray-50 px-3 py-2"><p className="text-gray-500">{t("invested")}</p><p className="font-semibold text-gray-800">{f.money(6000)}</p></div>
          <div className="rounded-lg bg-gray-50 px-3 py-2"><p className="text-gray-500">{t("targetYield")}</p><p className="font-semibold text-gray-800">120 {f.unit("QTL")}</p></div>
        </div>
      </div>
      <div className="card p-4 sm:ml-8">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center text-xl">{emoji("Wheat")}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{f.crop("Wheat")} · {t("field", { n: 2 })}</p>
            <p className="text-xs text-gray-500">{f.season("RABI", LAST_SEASON)} · {t("harvested", { qty: `35 ${f.unit("QTL")}` })}</p>
          </div>
          <span className="badge-yellow">{f.status("HARVESTED")}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">{t("unsold", { qty: `5 ${f.unit("QTL")}` })}</span>
          <span className="font-bold text-primary-700">{t("profitTag")} {f.signed(63800)}</span>
        </div>
      </div>
    </div>
  );
}

// Expense list for one crop, like the app's expenses tab
export async function ExpenseMock() {
  const { t, f } = await load();
  return (
    <div aria-hidden className="card p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">{emoji("Potato")} {f.crop("Potato")} · {f.season("RABI", THIS_SEASON)}</p>
        <span className="btn-primary !py-1 !px-2.5 !text-xs gap-1"><Plus size={12} />{t("addExpense")}</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {EXPENSES.map((e) => {
          const cat = EXPENSE_CATEGORIES.find((c) => c.value === e.category)!;
          return (
            <li key={e.key} className="flex items-center gap-3 py-2.5">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${cat.color}`}>{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{t(e.key)}</p>
                <p className="text-xs text-gray-500 truncate">{f.category(e.category)} · {f.date(e.date)}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">{f.money(e.amount)}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 pt-3 border-t border-gray-200 flex justify-between text-sm">
        <span className="font-semibold text-gray-600">{t("total")}</span>
        <span className="font-bold text-gray-900">{f.money(EXPENSES.reduce((s, e) => s + e.amount, 0))}</span>
      </div>
    </div>
  );
}

// Season report: profit or loss per crop on a shared zero line
export async function ReportMock() {
  const { t, f } = await load();
  const rows = REPORT.map((r) => ({ ...r, profit: r.earned - r.invested }));
  const max = Math.max(...rows.map((r) => Math.abs(r.profit)));
  return (
    <div aria-hidden className="card p-4 select-none">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-gray-800">{t("report")}</p>
        <p className="text-xs text-gray-500">{f.season("RABI", LAST_SEASON)}</p>
      </div>
      <p className="text-xs text-gray-500 mt-3">{t("net")}</p>
      <p className="text-2xl font-extrabold text-primary-700">{f.signed(EARNED - INVESTED)}</p>
      <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">{t("byCrop")}</p>
      <div className="space-y-2.5">
        {rows.map((r) => {
          const width = `${(Math.abs(r.profit) / max) * 100}%`;
          const loss = r.profit < 0;
          return (
            <div key={r.crop} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 text-xs">
              <span className="text-gray-700 truncate">{emoji(r.crop)} {f.crop(r.crop)}</span>
              {/* Zero line in the middle: losses grow left, profits right */}
              <div className="grid grid-cols-2 h-4">
                <div className="flex justify-end border-r border-gray-300">
                  {loss && <span className="h-full rounded-l" style={{ width, background: LOSS }} />}
                </div>
                <div className="flex">
                  {!loss && <span className="h-full rounded-r" style={{ width, background: PROFIT }} />}
                </div>
              </div>
              <span className="text-right font-semibold text-gray-800">{f.signed(r.profit)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: PROFIT }} />{t("profitTag")}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: LOSS }} />{t("loss")}</span>
      </div>
    </div>
  );
}
