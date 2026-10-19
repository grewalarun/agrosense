'use client';
import { useParams } from "next/navigation";
import { FARMS, getActiveCycle, getLastClosedCycle, getCyclePL, fmt } from "@/lib/data";
import TopBar from "@/components/TopBar";
import { Plus, Droplets, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FieldsPage() {
  const params = useParams();
  const farmId = params.farmId as string;
  const farm = FARMS.find(f => f.id === farmId);
  if (!farm) return <div className="p-8 text-center text-gray-400">Farm not found.</div>;

  return (
    <div>
      <TopBar title="Fields" />
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">{farm.fields.length} fields · {farm.totalArea} acres total</p>
          <Link href={`/farms/${farmId}/fields/add`} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Add Field
          </Link>
        </div>
        <div className="space-y-3">
          {farm.fields.map(field => {
            const active = getActiveCycle(field.id);
            const lastClosed = getLastClosedCycle(field.id);
            const lastPL = lastClosed ? getCyclePL(lastClosed.id) : null;
            const activePL = active ? getCyclePL(active.id) : null;
            return (
              <Link key={field.id} href={`/farms/${farmId}/fields/${field.id}`}
                className="card p-4 flex items-start gap-4 hover:border-primary-200 hover:shadow-sm transition-all block">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${field.status === "Active" ? "bg-primary-100" : "bg-gray-100"}`}>
                  {field.status === "Active" ? "🌱" : "⬜"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{field.name}</p>
                    <span className={field.status === "Active" ? "badge-active" : "badge-empty"}>{field.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{field.area}Ac · {field.soil} · <Droplets size={10} className="inline" /> {field.irrigation}</p>
                  <div className="flex flex-wrap gap-2">
                    {active && activePL && (
                      <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                        🌱 {active.crop} · {fmt(activePL.expenses)} invested
                      </span>
                    )}
                    {lastClosed && lastPL && (
                      <span className="text-xs bg-primary-50 border border-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        Last: {lastClosed.crop} · {fmt(lastPL.profit)} profit
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </Link>
            );
          })}
          <Link href={`/farms/${farmId}/fields/add`}
            className="card p-4 border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-primary-600 h-16">
            <Plus size={18} /><span className="text-sm font-medium">Add new field</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
