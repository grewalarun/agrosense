import type { SeasonType } from "@/lib/types";

export const SEASON_TYPES: { value: SeasonType; label: string; months: string }[] = [
  { value: "RABI", label: "Rabi", months: "Oct – Mar" },
  { value: "KHARIF", label: "Kharif", months: "Jun – Oct" },
  { value: "ZAID", label: "Zaid", months: "Mar – Jun" },
  { value: "ANNUAL", label: "Annual", months: "12 months" },
];

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

export function seasonLabel(seasonType: SeasonType, startDate: string | Date) {
  const label = SEASON_TYPES.find((s) => s.value === seasonType)?.label ?? seasonType;
  return `${label} ${getSeasonYear(seasonType, startDate)}`;
}

// Season type usually being sown in a given month: Rabi Oct–Feb, Zaid Mar–May, Kharif Jun–Sep
export function currentSeasonType(date = new Date()): SeasonType {
  const month = date.getMonth();
  if (month >= 9 || month <= 1) return "RABI";
  if (month <= 4) return "ZAID";
  return "KHARIF";
}

// Season currently being sown, for display, e.g. "Rabi 2026-27"
export function currentSeasonLabel(date = new Date()) {
  return seasonLabel(currentSeasonType(date), date);
}
