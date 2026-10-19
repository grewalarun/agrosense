import TopBar from "@/components/TopBar";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { getFarmCards } from "@/lib/api/farms";
import { fmt, formatArea, formatLocation } from "@/lib/format";

export default async function FarmsPage() {
  const { farms } = await getFarmCards();

  return (
    <div>
      <TopBar title="My Farms" />
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">All Farms</h2>
            <p className="text-sm text-gray-500">{farms.length} farm{farms.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/farms/add" className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Add Farm</Link>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {farms.map(({ farm, fieldCount, activeCycles, activeInvestment, totals }) => (
            <Link key={farm._id} href={`/farms/${farm._id}`}
              className="card p-5 hover:border-primary-300 hover:shadow-md transition-all block group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">🌾</div>
                {activeCycles > 0 && <span className="badge-active">{activeCycles} growing</span>}
              </div>
              <h3 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors">{farm.name}</h3>
              {formatLocation(farm.location) && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12} /> {formatLocation(farm.location)}</p>
              )}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div><p className="text-xs text-gray-400">Area</p><p className="text-sm font-semibold text-gray-700">{formatArea(farm.totalArea, farm.areaUnit)}</p></div>
                <div><p className="text-xs text-gray-400">Active</p><p className="text-sm font-semibold text-primary-600">{activeCycles} crop{activeCycles !== 1 ? "s" : ""}</p></div>
                <div><p className="text-xs text-gray-400">Fields</p><p className="text-sm font-semibold text-gray-700">{fieldCount}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">All-time profit</p>
                  <p className={`text-base font-bold ${totals.profit >= 0 ? "text-primary-600" : "text-red-600"}`}>
                    {totals.profit < 0 && "-"}{fmt(totals.profit)}
                  </p>
                </div>
                {activeInvestment > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Active invested</p>
                    <p className="text-sm font-semibold text-amber-600">{fmt(activeInvestment)}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
          <Link href="/farms/add"
            className="card p-5 border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-600 min-h-[180px]">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center"><Plus size={22} /></div>
            <p className="text-sm font-medium">Add New Farm</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
