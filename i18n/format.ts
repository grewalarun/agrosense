import type { AreaUnit, CycleStatus, ExpenseCategory, SeasonType } from "@/lib/types";
import type { Locale } from "./config";
import { COMMON_CROPS } from "@/lib/crops";
import { IRRIGATION_TYPES, SOIL_TYPES, fmt, signedFmt } from "@/lib/format";

// Root-level translator (keys like "categories.SEEDS"); typed loosely so labels can be built from data
export type Translate = (key: string, values?: Record<string, string | number>) => string;

const DATE_LOCALE = { en: "en-IN" } as const;
const YIELD_UNITS = ["QTL", "TON", "KG", "MAUND"];

// Labels and formatting that depend on the user's language. Amounts keep Indian
// grouping with Latin digits in every language; dates use local month names.
// "Sandy Loam" -> "sandyLoam": message key for values that are stored in English
export const slugKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");

export function makeFormatters(locale: Locale, t: Translate) {
  const areaUnit = (unit: AreaUnit, long = false) => t(`areaUnits.${unit}.${long ? "long" : "short"}`);
  const yieldUnit = (unit: string, long = false) =>
    YIELD_UNITS.includes(unit) ? t(`yieldUnits.${unit}.${long ? "long" : "short"}`) : unit;
  const seasonType = (type: SeasonType) => t(`seasons.${type}`);
  // Translates a stored English value if it is one of ours, otherwise shows it as entered
  const known = (group: "soilTypes" | "irrigationTypes", list: string[], value?: string | null) =>
    value && list.includes(value) ? t(`${group}.${slugKey(value)}`) : value ?? "";

  return {
    locale,
    money: fmt,
    signed: signedFmt,
    // English uses the platform's en-IN format ("19 Oct 2026"). Hindi and Punjabi build the
    // date from translated month names, because browsers' locale data for them varies and
    // the server and browser must render the same text.
    date: (iso?: string) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (locale === "en") {
        return d.toLocaleDateString(DATE_LOCALE.en, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
      }
      return `${d.getUTCDate()} ${t(`months.m${d.getUTCMonth() + 1}`)} ${d.getUTCFullYear()}`;
    },
    areaUnit,
    area: (area: number, unit: AreaUnit, long = false) => `${area} ${areaUnit(unit, long)}`,
    unit: yieldUnit,
    category: (category: ExpenseCategory) => t(`categories.${category}`),
    status: (status: CycleStatus) => t(`cycleStatus.${status}`),
    seasonType,
    season: (type: SeasonType, year: string) => `${seasonType(type)} ${year}`,
    soil: (value?: string | null) => known("soilTypes", SOIL_TYPES, value),
    irrigation: (value?: string | null) => known("irrigationTypes", IRRIGATION_TYPES, value),
    // Built-in crops are translated; names the user typed are shown as typed
    crop: (name?: string | null) => {
      const known = COMMON_CROPS.find((c) => c.name.toLowerCase() === name?.toLowerCase());
      return known ? t(`crops.${known.name}`) : name ?? "";
    },
  };
}

export type Formatters = ReturnType<typeof makeFormatters>;
