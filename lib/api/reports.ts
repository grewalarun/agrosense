import "server-only";
import { apiFetch, orNotFound } from "@/lib/dal";
import type { CycleRow, ReportTotals, SeasonType } from "@/lib/types";

export type SeasonSummary = ReportTotals & { seasonType: SeasonType; seasonYear: string; season: string };
export type CropSummary = ReportTotals & { crop: CycleRow["crop"] };

// One line per season, newest first, optionally for one farm
export async function getSeasons(farmId?: string) {
  return orNotFound(apiFetch<{ seasons: SeasonSummary[]; totals: ReportTotals }>("/reports/seasons", { query: { farmId } }));
}

export async function getSeason(seasonType: SeasonType, seasonYear: string, farmId?: string) {
  return orNotFound(
    apiFetch<{ season: string; totals: ReportTotals; byCrop: CropSummary[]; cycles: CycleRow[] }>(
      `/reports/seasons/${seasonType}/${encodeURIComponent(seasonYear)}`,
      { query: { farmId } }
    )
  );
}

// Every crop cycle across all farms (or one farm), newest first
export async function getAllCycleRows(farmId?: string) {
  return apiFetch<{ cycles: CycleRow[]; totals: ReportTotals }>("/reports/cycles", { query: { farmId } });
}
