"use server";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import type { Harvest, HarvestQuality, Sale } from "@/lib/types";

export type HarvestInput = {
  quantity: number;
  quality?: HarvestQuality;
  date: string;
  notes?: string;
  // false for crops picked several times; the crop stays active and the field busy
  completesCycle: boolean;
};

export type SaleInput = { quantity: number; pricePerUnit: number; buyer?: string; date: string };

export type HarvestAndSellResult = { harvestId: string; salesSaved: number; error?: string };

// Records a new harvest (or uses an existing one when selling stock later), then each
// sale lot in order. If a lot fails, earlier lots stay saved and the error says which.
export async function harvestAndSellAction(
  cycleId: string,
  source: { harvest: HarvestInput } | { harvestId: string },
  lots: SaleInput[]
): Promise<Result<HarvestAndSellResult>> {
  let harvestId: string;
  if ("harvest" in source) {
    const created = await run(() =>
      apiFetch<{ harvest: Harvest }>(`/cycles/${encodeURIComponent(cycleId)}/harvests`, { method: "POST", body: source.harvest })
    );
    if (created.error !== undefined) return created;
    harvestId = created.data.harvest._id;
  } else {
    harvestId = source.harvestId;
  }

  let salesSaved = 0;
  let error: string | undefined;
  for (const [index, lot] of lots.entries()) {
    try {
      await apiFetch<{ sale: Sale }>(`/harvests/${encodeURIComponent(harvestId)}/sales`, { method: "POST", body: lot });
      salesSaved++;
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      error = `Lot ${index + 1} was not saved: ${e.message}`;
      break;
    }
  }

  revalidatePath("/", "layout");
  if ("harvestId" in source && salesSaved === 0 && error) return { error };
  return { data: { harvestId, salesSaved, error } };
}

export async function deleteSaleAction(saleId: string): Promise<Result<null>> {
  const result = await run(async () => {
    await apiFetch(`/sales/${encodeURIComponent(saleId)}`, { method: "DELETE" });
    return null;
  });
  if (result.error === undefined) revalidatePath("/", "layout");
  return result;
}

export async function deleteHarvestAction(harvestId: string): Promise<Result<null>> {
  const result = await run(async () => {
    await apiFetch(`/harvests/${encodeURIComponent(harvestId)}`, { method: "DELETE" });
    return null;
  });
  if (result.error === undefined) revalidatePath("/", "layout");
  return result;
}
