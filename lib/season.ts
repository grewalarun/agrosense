import type { SeasonType } from "@/lib/types";

// Labels and month ranges are in the "seasons" and "seasonMonths" messages
export const SEASON_TYPES: { value: SeasonType }[] = [{ value: "RABI" }, { value: "KHARIF" }, { value: "ZAID" }, { value: "ANNUAL" }];

// Same rules as the backend: Rabi sown Jan–Jun belongs to the season that started
// the previous year; Rabi and Annual span two years ("2026-27"), Kharif/Zaid one.
export function getSeasonYear(seasonType: SeasonType, startDate: string | Date) {
  const date = new Date(startDate);
  const year = date.getFullYear();
  const span = (from: number) => `${from}-${String(from + 1).slice(-2)}`;
  if (seasonType === "RABI") return date.getMonth() >= 6 ? span(year) : span(year - 1);
  if (seasonType === "ANNUAL") return span(year);
  return String(year);
}

// Season type usually being sown in a given month: Rabi Oct–Feb, Zaid Mar–May, Kharif Jun–Sep
export function currentSeasonType(date = new Date()): SeasonType {
  const month = date.getMonth();
  if (month >= 9 || month <= 1) return "RABI";
  if (month <= 4) return "ZAID";
  return "KHARIF";
}
