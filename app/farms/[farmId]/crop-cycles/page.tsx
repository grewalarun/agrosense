'use client';
import { useParams } from "next/navigation";
import { CROP_CYCLES } from "@/lib/data";
import TopBar from "@/components/TopBar";
import { Plus, Calendar, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

const statusColor = (s: string) => s === "Active" ? "badge-active" : s === "Harvested" ? "badge-yellow" : "badge-empty";

export default function CropCyclesPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  return (
    <div>
      <TopBar title="Crop Cycles" />
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{CROP_CYCLES.length} crop cycles</p>
          <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Add Crop
          </Link>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["All", "Active", "Harvested", "Planned"].map(s => (
            <button key={s} className={`text-xs px-3 py-1.5 rounded-full font-medium border whitespace-nowrap transition-colors ${s === "All" ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-200 text-gray-500 hover:border-primary-300"}`}>
              {s}{s !== "All" && ` (${CROP_CYCLES.filter(c => c.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {CROP_CYCLES.map(cc => (
            <Link key={cc.id} href={`/farms/${farmId}/crop-cycles/${cc.id}`}
              className="card p-4 flex items-start gap-4 hover:border-primary-200 hover:shadow-sm transition-all block">
              <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {cc.status === "Active" ? "🌱" : cc.status === "Harvested" ? "🌾" : "📋"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-800">{cc.crop}</h4>
                  <span className={statusColor(cc.status)}>{cc.status}</span>
                  {cc.status === "Active" && (
                    <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
                      <Sparkles size={11} /> AI estimate available
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">📍 {cc.fieldName}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {cc.startDate}</span>
                  {cc.endDate && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> {cc.endDate}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Expected</p>
                  <p className="text-sm font-bold text-gray-700">{cc.expectedYield} Q</p>
                  {cc.actualYield && <p className="text-xs font-bold text-primary-600">{cc.actualYield} Q actual</p>}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>

        {CROP_CYCLES.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No crop cycles yet</h3>
            <Link href={`/farms/${farmId}/crop-cycles/add`} className="btn-primary inline-flex mt-3"><Plus size={14} className="mr-1.5" /> Add First Crop</Link>
          </div>
        )}
      </main>
    </div>
  );
}
