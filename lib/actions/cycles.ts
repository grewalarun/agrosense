"use server";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import { COMMON_CROPS } from "@/lib/crops";
import type { Crop, CropCycle, CycleStatus, SeasonType } from "@/lib/types";

export type CycleInput = {
  fieldId: string;
  cropName: string;
  seasonType: SeasonType;
  startDate: string;
  expectedHarvestDate?: string;
  expectedYield?: number;
  yieldUnit: string;
  variety?: string;
  notes?: string;
  status: "PLANNED" | "ACTIVE";
};

// Crops are per user: reuse the user's crop with this name, or create it
async function findOrCreateCrop(name: string, defaultUnit: string): Promise<string> {
  const { crops } = await apiFetch<{ crops: Crop[] }>("/crops");
  const existing = crops.find((crop) => crop.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing._id;
  try {
    const { crop } = await apiFetch<{ crop: Crop }>("/crops", { method: "POST", body: { name, defaultUnit } });
    return crop._id;
  } catch (error) {
    // Created by another request in the meantime
    if (error instanceof ApiError && error.status === 409) return findOrCreateCrop(name, defaultUnit);
    throw error;
  }
}

export async function createCycleAction(input: CycleInput): Promise<Result<{ cycleId: string }>> {
  const typed = input.cropName.trim();
  if (!typed) return { error: "Enter a crop name" };
  // "mustard" -> "Mustard" for known crops; other names are kept as typed
  const cropName = COMMON_CROPS.find((c) => c.name.toLowerCase() === typed.toLowerCase())?.name ?? typed;

  const result = await run(async () => {
    const cropId = await findOrCreateCrop(cropName, input.yieldUnit);
    const { cycle } = await apiFetch<{ cycle: CropCycle }>(`/fields/${encodeURIComponent(input.fieldId)}/cycles`, {
      method: "POST",
      body: {
        cropId,
        seasonType: input.seasonType,
        startDate: input.startDate,
        expectedHarvestDate: input.expectedHarvestDate || undefined,
        expectedYield: input.expectedYield,
        yieldUnit: input.yieldUnit,
        variety: input.variety || undefined,
        notes: input.notes || undefined,
        status: input.status,
      },
    });
    return { cycleId: cycle._id };
  });
  if (result.data) revalidatePath("/", "layout");
  return result;
}

// Planned -> Active (start the crop) and Harvested -> Closed (lock the season's numbers)
export async function updateCycleStatusAction(cycleId: string, status: CycleStatus): Promise<Result<null>> {
  const result = await run(async () => {
    await apiFetch(`/cycles/${encodeURIComponent(cycleId)}`, { method: "PATCH", body: { status } });
    return null;
  });
  if (result.error === undefined) revalidatePath("/", "layout");
  return result;
}

export async function deleteCycleAction(cycleId: string): Promise<Result<null>> {
  const result = await run(async () => {
    await apiFetch(`/cycles/${encodeURIComponent(cycleId)}`, { method: "DELETE" });
    return null;
  });
  if (result.error === undefined) revalidatePath("/", "layout");
  return result;
}
