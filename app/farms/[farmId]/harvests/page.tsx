'use client';
import { useParams } from "next/navigation";
import { HARVESTS } from "@/lib/data";
import TopBar from "@/components/TopBar";
import { Plus, Award } from "lucide-react";
import Link from "next/link";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const qualityColor = { A: "bg-primary-100 text-primary-700", B: "bg-accent-100 text-accent-700", C: "bg-gray-100 text-gray-600" };
const totalQty = HARVESTS.reduce((a, h) => a + h.quantity, 0);

export default function HarvestsPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  return (
    <div>
      <TopBar title="Harvests" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">Total Harvests</p><p className="text-xl font-bold text-gray-800 mt-0.5">{HARVESTS.length}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Total Quantity</p><p className="text-xl font-bold text-gray-800 mt-0.5">{totalQty} Q</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Grade A</p><p className="text-xl font-bold text-primary-600 mt-0.5">{HARVESTS.filter(h => h.quality === "A").length}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Harvest Records</h3>
          <Link href={`/farms/${farmId}/harvests/add`} className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Record Harvest</Link>
        </div>
        {HARVESTS.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌾</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No harvests yet</h3>
            <p className="text-sm text-gray-400 mb-4">Record your first harvest</p>
            <Link href={`/farms/${farmId}/harvests/add`} className="btn-primary inline-flex"><Plus size={14} className="mr-1.5" /> Record Harvest</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {HARVESTS.map(h => (
              <div key={h.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-accent-100 rounded-xl flex items-center justify-center text-lg">🌾</div>
                    <div><p className="font-semibold text-gray-800">{h.crop}</p><p className="text-xs text-gray-500">{h.fieldName}</p></div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${qualityColor[h.quality]}`}>
                    <Award size={10} /> Grade {h.quality}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Quantity</p><p className="text-sm font-bold text-gray-700">{h.quantity} {h.unit}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Date</p><p className="text-xs font-semibold text-gray-700">{h.date}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
