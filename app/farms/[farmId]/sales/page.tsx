'use client';
import { useParams } from "next/navigation";
import { SALES } from "@/lib/data";
import TopBar from "@/components/TopBar";
import { Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const totalRevenue = SALES.reduce((a, s) => a + s.total, 0);
const totalQty = SALES.reduce((a, s) => a + s.quantity, 0);

export default function SalesPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  return (
    <div>
      <TopBar title="Sales" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">Total Revenue</p><p className="text-xl font-bold text-primary-600 mt-0.5">{fmt(totalRevenue)}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Transactions</p><p className="text-xl font-bold text-gray-800 mt-0.5">{SALES.length}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Qty Sold</p><p className="text-xl font-bold text-gray-800 mt-0.5">{totalQty} Q</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Sale Records</h3>
          <Link href={`/farms/${farmId}/sales/add`} className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Record Sale</Link>
        </div>
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
                </tr>
              </thead>
              <tbody>
                {SALES.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-base">🌾</span><p className="font-medium text-gray-700 text-xs">{s.crop}</p></div></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{s.buyer}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-600">{s.quantity} {s.unit}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{fmt(s.pricePerUnit)}/{s.unit}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{s.date}</td>
                    <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-primary-600">{fmt(s.total)}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-gray-600 flex items-center gap-1"><TrendingUp size={12} className="text-primary-600" /> Total</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{fmt(totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
