'use client';
import { useParams } from "next/navigation";
import { FARMS, getActiveCycle, getLastClosedCycle, getCyclePL, fmt } from "@/lib/data";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Droplets, Layers, MapPin, Plus, ChevronRight } from "lucide-react";

export default function FarmDetailPage() {
  const params = useParams();
  const farmId = params.farmId as string;

  const farm = FARMS.find(f => f.id === farmId);
  if (!farm) return <div className="p-8 text-center text-gray-400">Farm not found.</div>;

  return (
    <div>
      <TopBar title={farm.name} />
      <main className="p-4 lg:p-6 space-y-5">
        {/* Farm info */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌾</span>
            <div>
              <h2 className="font-bold text-gray-800">{farm.name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {farm.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Area", value: `${farm.totalArea} Acres` },
              { label: "Irrigation", value: farm.irrigation, icon: <Droplets size={12} /> },
              { label: "Soil Type", value: farm.soilType, icon: <Layers size={12} /> },
              { label: "Season", value: farm.season },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 flex items-center gap-1">{item.icon}{item.label}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fields with live P&L from cycles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Fields</h3>
            <Link href={`/farms/${farmId}/fields/add`} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
              <Plus size={13} /> Add Field
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {farm.fields.map(field => {
              const active = getActiveCycle(field.id);
              const lastClosed = getLastClosedCycle(field.id);
              const activePL = active ? getCyclePL(active.id) : null;
              const lastPL = lastClosed ? getCyclePL(lastClosed.id) : null;
              return (
                <Link key={field.id} href={`/farms/${farmId}/fields/${field.id}`}
                  className="card p-4 hover:border-primary-200 hover:shadow-sm transition-all block">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${field.status === "Active" ? "bg-primary-100" : "bg-gray-100"}`}>
                        {field.status === "Active" ? "🌱" : "⬜"}
                      </div>
                      <p className="font-medium text-gray-800 text-sm">{field.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={field.status === "Active" ? "badge-active" : "badge-empty"}>{field.status}</span>
                      <ChevronRight size={13} className="text-gray-300" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{field.area}Ac · {field.soil} · {field.irrigation}</p>
                  {active && (
                    <p className="text-xs font-semibold text-amber-600 mb-1">🌱 {active.crop} · {activePL ? fmt(activePL.expenses) : "—"} invested</p>
                  )}
                  {lastClosed && lastPL && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">Last: {lastClosed.crop}</span>
                      <span className="text-sm font-bold text-primary-600">{fmt(lastPL.profit)} profit</span>
                    </div>
                  )}
                  {field.status === "Empty" && (
                    <Link href={`/farms/${farmId}/crop-cycles/add`}
                      onClick={e => e.stopPropagation()}
                      className="mt-2 block w-full btn-primary py-1.5 text-xs justify-center">
                      + Plant a Crop
                    </Link>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Crop Cycles", href: `/farms/${farmId}/crop-cycles`, emoji: "🔄" },
            { label: "Expenses",    href: `/farms/${farmId}/expenses`,    emoji: "💰" },
            { label: "Harvests",    href: `/farms/${farmId}/harvests`,    emoji: "🌾" },
            { label: "Sales",       href: `/farms/${farmId}/sales`,       emoji: "🛒" },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="card p-3 hover:border-primary-200 hover:shadow-sm transition-all text-center block">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <p className="text-xs font-medium text-gray-600">{item.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
