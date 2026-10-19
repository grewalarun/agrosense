import { getFarmReport } from "@/lib/api/farms";
import { getCrops } from "@/lib/api/cycles";
import AddCycleForm from "./add-cycle-form";

export default async function AddCropPage(props: PageProps<"/farms/[farmId]/crop-cycles/add">) {
  const { farmId } = await props.params;
  const { fieldId } = await props.searchParams;
  const [{ fields }, crops] = await Promise.all([getFarmReport(farmId), getCrops()]);

  return (
    <AddCycleForm
      farmId={farmId}
      fields={fields.map(({ field, activeCycle }) => ({
        _id: field._id,
        name: field.name,
        area: field.area,
        areaUnit: field.areaUnit,
        soilType: field.soilType,
        activeCrop: activeCycle?.crop?.name ?? null,
      }))}
      userCrops={crops.filter(c => c.active).map(c => c.name)}
      initialFieldId={typeof fieldId === "string" ? fieldId : ""}
    />
  );
}
