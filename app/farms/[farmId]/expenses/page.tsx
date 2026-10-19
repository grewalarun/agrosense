'use client';
import { useParams } from "next/navigation";
import { EXPENSES } from "@/lib/data";
import TopBar from "@/components/TopBar";
import { Plus } from "lucide-react";
import Link from "next/link";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const total = EXPENSES.reduce((a, e) => a + e.amount, 0);
const CATEGORIES = ["All", "Seeds", "Fertilizer", "Pesticide", "Labour", "Equipment", "Irrigation"];
const catColor: Record<string, string> = {
  Seeds: "bg-green-100 text-green-700", Fertilizer: "bg-blue-100 text-blue-700",
  Pesticide: "bg-orange-100 text-orange-700", Labour: "bg-purple-100 text-purple-700",
  Equipment: "bg-gray-100 text-gray-700", Irrigation: "bg-cyan-100 text-cyan-700",
};

export default function ExpensesPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  return (
    <div>
      <TopBar title="Expenses" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">Total Expenses</p><p className="text-xl font-bold text-red-600 mt-0.5">{fmt(total)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">This Month</p><p className="text-xl font-bold text-gray-700 mt-0.5">{fmt(7500)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Transactions</p><p className="text-xl font-bold text-gray-700 mt-0.5">{EXPENSES.length}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.slice(0, 5).map(c => (
              <button key={c} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${c === "All" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"}`}>{c}</button>
            ))}
          </div>
          <Link href={`/farms/${farmId}/expenses/add`} className="btn-primary flex items-center gap-1.5 flex-shrink-0 ml-2"><Plus size={14} /> Add</Link>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Field</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><p className="font-medium text-gray-700 text-xs">{e.description}</p></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor[e.category] || "bg-gray-100 text-gray-600"}`}>{e.category}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-gray-500">{e.fieldName || "—"}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{e.date}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-red-600">{fmt(e.amount)}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr><td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-600">Total</td><td className="px-4 py-3 text-right text-sm font-bold text-red-600">{fmt(total)}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
