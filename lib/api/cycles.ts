import "server-only";
import { notFound } from "next/navigation";
import { apiFetch, orNotFound } from "@/lib/dal";
import { getFarm } from "@/lib/api/farms";
import type { Crop, CropCycle, CycleRow, Expense, ExpenseCategory, ExpenseListItem, Harvest, ReportTotals, Sale } from "@/lib/types";

export async function getCrops() {
  const { crops } = await apiFetch<{ crops: Crop[] }>("/crops");
  return crops;
}

// Every crop cycle on the farm with its P&L, newest first
export async function getCycleRows(farmId: string) {
  return orNotFound(apiFetch<{ cycles: CycleRow[]; totals: ReportTotals }>("/reports/cycles", { query: { farmId } }));
}

export async function getCycleDetail(farmId: string, cycleId: string) {
  const [{ report }, { cycle }, { expenses }, { sales }, { harvests }, farm] = await Promise.all([
    orNotFound(apiFetch<{ report: CycleRow }>(`/reports/cycles/${cycleId}`)),
    orNotFound(apiFetch<{ cycle: CropCycle }>(`/cycles/${cycleId}`)),
    orNotFound(apiFetch<{ expenses: Expense[] }>(`/cycles/${cycleId}/expenses`)),
    orNotFound(apiFetch<{ sales: Sale[] }>(`/cycles/${cycleId}/sales`)),
    orNotFound(apiFetch<{ harvests: Harvest[] }>(`/cycles/${cycleId}/harvests`)),
    getFarm(farmId),
  ]);
  if (report.farmId !== farmId) notFound();
  return { report, cycle, expenses, sales, harvests, farm };
}

export async function getFarmExpenses(farmId: string, category?: ExpenseCategory) {
  return orNotFound(
    apiFetch<{ expenses: ExpenseListItem[]; total: number }>("/expenses", { query: { farmId, category } })
  );
}
