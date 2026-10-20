import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getFarmExpenses } from "@/lib/api/cycles";
import { EXPENSE_CATEGORIES, categoryColor, categoryLabel, fmt, formatDate } from "@/lib/format";
import { SEASON_TYPES } from "@/lib/season";
import type { ExpenseCategory } from "@/lib/types";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { deleteExpenseAction } from "@/lib/actions/expenses";

export default async function ExpensesPage(props: PageProps<"/farms/[farmId]/expenses">) {
  const { farmId } = await props.params;
  const { category } = await props.searchParams;
  const filter = EXPENSE_CATEGORIES.find(c => c.value === category)?.value;

  const { expenses, total } = await getFarmExpenses(farmId, filter as ExpenseCategory | undefined);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const thisMonth = expenses.filter(e => new Date(e.date) >= monthStart).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <TopBar title="Expenses" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">{filter ? categoryLabel(filter) : "Total Expenses"}</p><p className="text-xl font-bold text-red-600 mt-0.5">{fmt(total)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">This Month</p><p className="text-xl font-bold text-gray-700 mt-0.5">{fmt(thisMonth)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Transactions</p><p className="text-xl font-bold text-gray-700 mt-0.5">{expenses.length}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ value: undefined, label: "All" }, ...EXPENSE_CATEGORIES].map(c => (
              <Link key={c.label} href={c.value ? `/farms/${farmId}/expenses?category=${c.value}` : `/farms/${farmId}/expenses`}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${c.value === filter ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                {c.label}
              </Link>
            ))}
          </div>
          <Link href={`/farms/${farmId}/expenses/add`} className="btn-primary flex items-center gap-1.5 flex-shrink-0 ml-2"><Plus size={14} /> Add</Link>
        </div>
        {expenses.length === 0 ? (
          <div className="card p-10 text-center text-sm text-gray-400">
            No expenses {filter ? `in ${categoryLabel(filter)}` : "recorded yet"}.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Description</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Crop · Field</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Amount</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => {
                    const cycle = e.cycleId;
                    const season = cycle ? `${SEASON_TYPES.find(s => s.value === cycle.seasonType)?.label} ${cycle.seasonYear}` : "";
                    return (
                      <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-700 text-xs">{e.description || categoryLabel(e.category)}</p>
                          {e.notes && <p className="text-xs text-gray-400">{e.notes}</p>}
                          <p className="text-xs text-gray-400 md:hidden">{formatDate(e.date)}</p>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(e.category)}`}>{categoryLabel(e.category)}</span></td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {cycle ? (
                            <Link href={`/farms/${farmId}/crop-cycles/${cycle._id}`} className="text-xs text-gray-600 hover:text-primary-600">
                              {cycle.cropId?.name} · {e.fieldId?.name}
                              <span className="block text-gray-400">{season}</span>
                            </Link>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{formatDate(e.date)}</span></td>
                        <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-red-600">{fmt(e.amount)}</span></td>
                        <td className="px-3 py-3 text-right">
                          {cycle && cycle.status !== "CLOSED" && (
                            <span className="flex items-center justify-end gap-3">
                              <Link href={`/farms/${farmId}/crop-cycles/${cycle._id}#expense-${e._id}`} className="text-gray-300 hover:text-primary-600" title="Edit on crop page"><Pencil size={13} /></Link>
                              <ConfirmDeleteButton action={deleteExpenseAction.bind(null, e._id)} label={e.description || categoryLabel(e.category)} />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr><td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-600">Total</td><td className="px-4 py-3 text-right text-sm font-bold text-red-600">{fmt(total)}</td><td /></tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
