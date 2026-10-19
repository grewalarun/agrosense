import TopBar from "@/components/TopBar";
import Link from "next/link";
import { Plus, Award } from "lucide-react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { getFarmHarvests } from "@/lib/api/harvests";
import { deleteHarvestAction } from "@/lib/actions/harvests";
import { cropEmoji } from "@/lib/crops";
import { formatDate, unitLabel } from "@/lib/format";

const qualityColor = { A: "bg-primary-100 text-primary-700", B: "bg-accent-100 text-accent-700", C: "bg-gray-100 text-gray-600" };

export default async function HarvestsPage(props: PageProps<"/farms/[farmId]/harvests">) {
  const { farmId } = await props.params;
  const { harvests, totals } = await getFarmHarvests(farmId);
  const totalsText = Object.entries(totals).map(([unit, t]) => `${t.quantity} ${unitLabel(unit)}`).join(" + ") || "0";
  const stockText = Object.entries(totals).filter(([, t]) => t.remaining > 0).map(([unit, t]) => `${t.remaining} ${unitLabel(unit)}`).join(" + ") || "0";

  return (
    <div>
      <TopBar title="Harvests" />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-4"><p className="text-xs text-gray-400">Total Harvests</p><p className="text-xl font-bold text-gray-800 mt-0.5">{harvests.length}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Total Quantity</p><p className="text-xl font-bold text-gray-800 mt-0.5">{totalsText}</p></div>
          <div className="card p-4"><p className="text-xs text-gray-400">Unsold stock</p><p className="text-xl font-bold text-amber-600 mt-0.5">{stockText}</p></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Harvest Records</h3>
          <Link href={`/farms/${farmId}/harvests/add`} className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Record Harvest</Link>
        </div>
        {harvests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌾</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No harvests yet</h3>
            <p className="text-sm text-gray-400 mb-4">Record your first harvest</p>
            <Link href={`/farms/${farmId}/harvests/add`} className="btn-primary inline-flex"><Plus size={14} className="mr-1.5" /> Record Harvest</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {harvests.map(h => {
              const u = unitLabel(h.unit);
              return (
                <div key={h._id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/farms/${farmId}/crop-cycles/${h.cycleId}`} className="flex items-center gap-2 group">
                      <div className="w-9 h-9 bg-accent-100 rounded-xl flex items-center justify-center text-lg">{cropEmoji(h.cropId?.name)}</div>
                      <div><p className="font-semibold text-gray-800 group-hover:text-primary-700">{h.cropId?.name}</p><p className="text-xs text-gray-500">{h.fieldId?.name}</p></div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {h.quality && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${qualityColor[h.quality]}`}>
                          <Award size={10} /> Grade {h.quality}
                        </span>
                      )}
                      {h.soldQuantity === 0 && <ConfirmDeleteButton action={deleteHarvestAction.bind(null, h._id)} label="harvest" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Harvested</p><p className="text-sm font-bold text-gray-700">{h.quantity} {u}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Sold</p><p className="text-sm font-bold text-primary-600">{h.soldQuantity} {u}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Date</p><p className="text-xs font-semibold text-gray-700">{formatDate(h.date)}</p></div>
                  </div>
                  {h.remainingQuantity > 0 && h.fieldId && (
                    <Link href={`/farms/${farmId}/fields/${h.fieldId._id}/harvest?cycleId=${h.cycleId}&sell=1`}
                      className="mt-3 flex items-center justify-between text-xs bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-3 py-2 hover:bg-amber-100">
                      <span>{h.remainingQuantity} {u} unsold</span><span className="font-semibold">Sell →</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
