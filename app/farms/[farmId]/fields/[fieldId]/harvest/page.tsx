import { notFound } from "next/navigation";
import { getHarvestFlow } from "@/lib/api/harvests";
import HarvestFlow from "./harvest-flow";

export default async function HarvestPage(props: PageProps<"/farms/[farmId]/fields/[fieldId]/harvest">) {
  const { farmId, fieldId } = await props.params;
  const { cycleId, sell } = await props.searchParams;
  if (typeof cycleId !== "string") notFound();

  const { report, cycle, expenses, harvests } = await getHarvestFlow(farmId, fieldId, cycleId);
  // A growing crop starts with recording the harvest; otherwise (or with ?sell=1) sell existing stock
  const mode = report.status === "ACTIVE" && sell !== "1" ? "harvest" : "sell";

  return (
    <HarvestFlow
      farmId={farmId}
      fieldId={fieldId}
      cycleId={cycleId}
      mode={mode}
      status={report.status}
      cropName={report.crop?.name ?? "Crop"}
      fieldName={cycle.fieldId.name}
      season={report.season}
      startDate={report.startDate}
      unit={report.yieldUnit}
      expectedYield={report.expectedYield}
      harvestedSoFar={report.actualYield}
      revenueSoFar={report.revenue}
      expenses={expenses.map(e => ({ _id: e._id, date: e.date, label: e.description || e.category, amount: e.amount }))}
      stock={harvests.filter(h => h.remainingQuantity > 0).map(h => ({ _id: h._id, date: h.date, remaining: h.remainingQuantity, quality: h.quality }))}
    />
  );
}
