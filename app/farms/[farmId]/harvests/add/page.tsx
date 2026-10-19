import Link from "next/link";
import CropPicker from "@/components/CropPicker";
import { getCycleRows } from "@/lib/api/cycles";
import { formatDate, unitLabel } from "@/lib/format";

export default async function AddHarvestPage(props: PageProps<"/farms/[farmId]/harvests/add">) {
  const { farmId } = await props.params;
  const { cycles } = await getCycleRows(farmId);
  const growing = cycles.filter(c => c.status === "ACTIVE" && c.field);

  return (
    <CropPicker
      title="Record Harvest"
      intro="Which crop are you harvesting?"
      backHref={`/farms/${farmId}/harvests`}
      items={growing.map(c => ({
        href: `/farms/${farmId}/fields/${c.field!._id}/harvest?cycleId=${c.cycleId}`,
        crop: c.crop?.name ?? "Crop",
        field: c.field!.name,
        detail: `${c.season} · sown ${formatDate(c.startDate)}${c.actualYield > 0 ? ` · ${c.actualYield} ${unitLabel(c.yieldUnit)} harvested so far` : ""}`,
      }))}
      empty={<>No crops are growing on this farm. <Link href={`/farms/${farmId}/crop-cycles/add`} className="text-primary-600 underline">Plant a crop</Link> first.</>}
    />
  );
}
