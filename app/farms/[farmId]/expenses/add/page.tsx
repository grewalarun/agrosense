import { getCycleRows } from "@/lib/api/cycles";
import AddExpenseForm from "./add-expense-form";

export default async function AddExpensePage(props: PageProps<"/farms/[farmId]/expenses/add">) {
  const { farmId } = await props.params;
  const { cycleId, fieldId } = await props.searchParams;
  const { cycles } = await getCycleRows(farmId);

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
        label: `${c.crop?.name} · ${c.field?.name}`,
        season: c.season,
        status: c.status,
      }))}
      initialCycleId={preselected?.cycleId ?? ""}
    />
  );
}
