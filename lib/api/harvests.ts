import "server-only";
import { notFound } from "next/navigation";
import { apiFetch, orNotFound } from "@/lib/dal";
import type { CropCycle, CycleRow, Expense, Harvest, HarvestListItem, HarvestTotals, Sale, SaleListItem } from "@/lib/types";

export async function getFarmHarvests(farmId: string) {
  return orNotFound(apiFetch<{ harvests: HarvestListItem[]; totals: HarvestTotals }>("/harvests", { query: { farmId } }));
}

export async function getFarmSales(farmId: string) {
  return orNotFound(
    apiFetch<{ sales: SaleListItem[]; totalQuantity: number; totalAmount: number }>("/sales", { query: { farmId } })
  );
}

// Everything the harvest & sell flow needs for one crop on one field
export async function getHarvestFlow(farmId: string, fieldId: string, cycleId: string) {
  const [{ report }, { cycle }, { expenses }, { harvests }, { sales }] = await Promise.all([
    orNotFound(apiFetch<{ report: CycleRow }>(`/reports/cycles/${cycleId}`)),
    orNotFound(apiFetch<{ cycle: CropCycle }>(`/cycles/${cycleId}`)),
    orNotFound(apiFetch<{ expenses: Expense[] }>(`/cycles/${cycleId}/expenses`)),
    orNotFound(apiFetch<{ harvests: Harvest[] }>(`/cycles/${cycleId}/harvests`)),
    orNotFound(apiFetch<{ sales: Sale[] }>(`/cycles/${cycleId}/sales`)),
  ]);
  if (report.farmId !== farmId || report.field?._id !== fieldId) notFound();
  return { report, cycle, expenses, harvests, sales };
}
