import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getFarmExpenses } from "@/lib/api/cycles";
import { getTranslations } from "next-intl/server";
import { EXPENSE_CATEGORIES, categoryColor, fmt } from "@/lib/format";
import { getFormatters } from "@/i18n/server";
import type { ExpenseCategory } from "@/lib/types";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { deleteExpenseAction } from "@/lib/actions/expenses";

export default async function ExpensesPage(props: PageProps<"/farms/[farmId]/expenses">) {
  const { farmId } = await props.params;
  const { category } = await props.searchParams;
  const filter = EXPENSE_CATEGORIES.find(c => c.value === category)?.value;

  const [{ expenses, total }, t, f] = await Promise.all([
    getFarmExpenses(farmId, filter as ExpenseCategory | undefined), getTranslations("expenses"), getFormatters(),
  ]);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const thisMonth = expenses.filter(e => new Date(e.date) >= monthStart).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <TopBar title={t("title")} />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">{filter ? f.category(filter) : t("total")}</p><p className="text-xl font-bold text-red-600 mt-0.5">{fmt(total)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">{t("thisMonth")}</p><p className="text-xl font-bold text-gray-700 mt-0.5">{fmt(thisMonth)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">{t("transactions")}</p><p className="text-xl font-bold text-gray-700 mt-0.5">{expenses.length}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ value: undefined, label: t("all") }, ...EXPENSE_CATEGORIES.map(c => ({ value: c.value, label: f.category(c.value) }))].map(c => (
              <Link key={c.label} href={c.value ? `/farms/${farmId}/expenses?category=${c.value}` : `/farms/${farmId}/expenses`}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${c.value === filter ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                {c.label}
              </Link>
            ))}
          </div>
          <Link href={`/farms/${farmId}/expenses/add`} className="btn-primary flex items-center gap-1.5 flex-shrink-0 ml-2"><Plus size={14} /> {t("add")}</Link>
        </div>
        {expenses.length === 0 ? (
          <div className="card p-10 text-center text-sm text-gray-400">
            {filter ? t("noneInCategory", { category: f.category(filter) }) : t("none")}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{t("colDescription")}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{t("colCategory")}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">{t("colCropField")}</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">{t("colDate")}</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">{t("colAmount")}</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => {
                    const cycle = e.cycleId;
                    const season = cycle ? f.season(cycle.seasonType, cycle.seasonYear) : "";
                    return (
                      <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-700 text-xs">{e.description || f.category(e.category)}</p>
                          {e.notes && <p className="text-xs text-gray-400">{e.notes}</p>}
                          <p className="text-xs text-gray-400 md:hidden">{f.date(e.date)}</p>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(e.category)}`}>{f.category(e.category)}</span></td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {cycle ? (
                            <Link href={`/farms/${farmId}/crop-cycles/${cycle._id}`} className="text-xs text-gray-600 hover:text-primary-600">
                              {f.crop(cycle.cropId?.name)} · {e.fieldId?.name}
                              <span className="block text-gray-400">{season}</span>
                            </Link>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{f.date(e.date)}</span></td>
                        <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-red-600">{fmt(e.amount)}</span></td>
                        <td className="px-3 py-3 text-right">
                          {cycle && cycle.status !== "CLOSED" && (
                            <span className="flex items-center justify-end gap-3">
                              <Link href={`/farms/${farmId}/crop-cycles/${cycle._id}#expense-${e._id}`} className="text-gray-300 hover:text-primary-600" title={t("editOnCrop")}><Pencil size={13} /></Link>
                              <ConfirmDeleteButton action={deleteExpenseAction.bind(null, e._id)} label={e.description || f.category(e.category)} />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr><td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-600">{t("totalRow")}</td><td className="px-4 py-3 text-right text-sm font-bold text-red-600">{fmt(total)}</td><td /></tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
