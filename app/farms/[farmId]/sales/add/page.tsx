import CropPicker from "@/components/CropPicker";
import { getCycleRows } from "@/lib/api/cycles";
import { unitLabel } from "@/lib/format";

export default async function AddSalePage(props: PageProps<"/farms/[farmId]/sales/add">) {
  const { farmId } = await props.params;
  const { cycles } = await getCycleRows(farmId);
  // Sales come out of harvested stock, so only crops with unsold stock can be sold
  const withStock = cycles
    .filter(c => c.status !== "CLOSED" && c.field)
    .map(c => ({ cycle: c, remaining: Object.values(c.harvested).reduce((sum, h) => sum + h.remaining, 0) }))
    .filter(({ remaining }) => remaining > 0);

  return (
    <CropPicker
      title="Record Sale"
      intro="Which crop are you selling?"
      backHref={`/farms/${farmId}/sales`}
      items={withStock.map(({ cycle: c, remaining }) => ({
        href: `/farms/${farmId}/fields/${c.field!._id}/harvest?cycleId=${c.cycleId}&sell=1`,
        crop: c.crop?.name ?? "Crop",
        field: c.field!.name,
        detail: `${c.season} · ${remaining} ${unitLabel(c.yieldUnit)} unsold`,
      }))}
      empty="No unsold stock. Record a harvest first — sales are made from harvested stock."
    />
  );
}
