import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { getFarmSales } from "@/lib/api/harvests";
import { deleteSaleAction } from "@/lib/actions/harvests";
import { cropEmoji } from "@/lib/crops";
import { fmt, formatDate, unitLabel } from "@/lib/format";

export default async function SalesPage(props: PageProps<"/farms/[farmId]/sales">) {
  const { farmId } = await props.params;
  const { sales, totalAmount } = await getFarmSales(farmId);
  const qtyByUnit = sales.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.unit]: Math.round(((acc[s.unit] ?? 0) + s.quantity) * 1000) / 1000 }), {});
  const qtyText = Object.entries(qtyByUnit).map(([unit, q]) => `${q} ${unitLabel(unit)}`).join(" + ") || "0";

  return (
    <div>
      <TopBar title="Sales" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">Total Revenue</p><p className="text-xl font-bold text-primary-600 mt-0.5">{fmt(totalAmount)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Transactions</p><p className="text-xl font-bold text-gray-800 mt-0.5">{sales.length}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Qty Sold</p><p className="text-xl font-bold text-gray-800 mt-0.5">{qtyText}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Sale Records</h3>
          <Link href={`/farms/${farmId}/sales/add`} className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Record Sale</Link>
        </div>
        {sales.length === 0 ? (
          <div className="card p-10 text-center text-sm text-gray-400">No sales recorded yet.</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Crop</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Buyer</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Qty</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Rate</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Total</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => {
                    const u = unitLabel(s.unit);
                    return (
                      <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/farms/${farmId}/crop-cycles/${s.cycleId}`} className="flex items-center gap-2 hover:text-primary-700">
                            <span className="text-base">{cropEmoji(s.cropId?.name)}</span>
                            <div><p className="font-medium text-gray-700 text-xs">{s.cropId?.name}</p><p className="text-xs text-gray-400">{s.fieldId?.name}</p></div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{s.buyer || "—"}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-600">{s.quantity} {u}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{fmt(s.pricePerUnit)}/{u}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatDate(s.date)}</td>
                        <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-primary-600">{fmt(s.totalAmount)}</span></td>
                        <td className="px-3 py-3 text-right"><ConfirmDeleteButton action={deleteSaleAction.bind(null, s._id)} label="sale" /></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-gray-600"><span className="flex items-center gap-1"><TrendingUp size={12} className="text-primary-600" /> Total</span></td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{fmt(totalAmount)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
