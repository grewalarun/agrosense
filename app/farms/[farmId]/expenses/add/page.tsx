import { getCycleRows } from "@/lib/api/cycles";
import { getFormatters } from "@/i18n/server";
import AddExpenseForm from "./add-expense-form";

export default async function AddExpensePage(props: PageProps<"/farms/[farmId]/expenses/add">) {
  const { farmId } = await props.params;
  const { cycleId, fieldId } = await props.searchParams;
  const [{ cycles }, f] = await Promise.all([getCycleRows(farmId), getFormatters()]);

  // Expenses always belong to a crop; closed crops are locked
  const open = cycles.filter(c => c.status !== "CLOSED");
  const preselected =
    open.find(c => c.cycleId === cycleId) ??
    open.find(c => c.field?._id === fieldId && c.status === "ACTIVE");

  return (
    <AddExpenseForm
      farmId={farmId}
      cycles={open.map(c => ({
        cycleId: c.cycleId,
        label: `${f.crop(c.crop?.name)} · ${c.field?.name}`,
        season: f.season(c.seasonType, c.seasonYear),
        status: c.status,
      }))}
      initialCycleId={preselected?.cycleId ?? ""}
    />
  );
}
