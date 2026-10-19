import "server-only";
import { notFound } from "next/navigation";
import { apiFetch, orNotFound } from "@/lib/dal";
import type { CycleRow, Expense, Farm, FarmCard, FarmReport, Field, FieldReport, Sale } from "@/lib/types";

export async function getFarmCards() {
  return apiFetch<{ farms: FarmCard[] }>("/reports/farms");
}

export async function getFarmIds() {
  const { farms } = await apiFetch<{ farms: { _id: string; name: string }[] }>("/farms");
  return farms;
}

export async function getFarm(farmId: string) {
  const { farm } = await orNotFound(apiFetch<{ farm: Farm }>(`/farms/${farmId}`));
  return farm;
}

export async function getFarmReport(farmId: string) {
  return orNotFound(apiFetch<FarmReport>(`/reports/farms/${farmId}`));
}

// Field detail: the field, its crop history with P&L, the active crop's expenses and all sales
export async function getFieldDetail(farmId: string, fieldId: string) {
  const [{ field }, report] = await Promise.all([
    orNotFound(apiFetch<{ field: Field }>(`/fields/${fieldId}`)),
    orNotFound(apiFetch<FieldReport>(`/reports/fields/${fieldId}`)),
  ]);
  if (field.farmId !== farmId) notFound();

  const activeCycle: CycleRow | null = report.cycles.find((c) => c.status === "ACTIVE") ?? null;
  const [expenses, sales] = await Promise.all([
    activeCycle
      ? apiFetch<{ expenses: Expense[] }>(`/cycles/${activeCycle.cycleId}/expenses`).then((r) => r.expenses)
      : Promise.resolve([] as Expense[]),
    apiFetch<{ sales: Sale[] }>("/sales", { query: { fieldId } }).then((r) => r.sales),
  ]);

  return { field, report, activeCycle, activeExpenses: expenses, sales };
}
