"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/dal";
import { type Result, run } from "@/lib/actions/run";
import type { AreaUnit, Farm, Field, Location } from "@/lib/types";

export type FarmInput = {
  name: string;
  location: Location;
  totalArea: number;
  areaUnit: AreaUnit;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
};

export type FieldInput = {
  name: string;
  area: number;
  areaUnit: AreaUnit;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
};

export async function createFarmAction(input: FarmInput): Promise<Result<{ farmId: string }>> {
  const result = await run(() => apiFetch<{ farm: Farm }>("/farms", { method: "POST", body: input }));
  if (result.error !== undefined) return result;
  revalidatePath("/", "layout");
  return { data: { farmId: result.data.farm._id } };
}

export async function createFieldAction(farmId: string, input: FieldInput): Promise<Result<{ fieldId: string }>> {
  const result = await run(() =>
    apiFetch<{ field: Field }>(`/farms/${encodeURIComponent(farmId)}/fields`, { method: "POST", body: input })
  );
  if (result.error !== undefined) return result;
  revalidatePath("/", "layout");
  return { data: { fieldId: result.data.field._id } };
}

// Onboarding creates the farm and its first field in one go
export async function completeOnboardingAction(
  farm: FarmInput,
  field: FieldInput
): Promise<Result<{ farmId: string; fieldId: string }>> {
  const created = await createFarmAction(farm);
  if (created.error !== undefined) return created;
  const fieldResult = await createFieldAction(created.data.farmId, field);
  if (fieldResult.error !== undefined) {
    return { error: `Farm was created, but the field could not be added: ${fieldResult.error}` };
  }
  return { data: { farmId: created.data.farmId, fieldId: fieldResult.data.fieldId } };
}
