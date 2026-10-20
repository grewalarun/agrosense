import type { AreaUnit, CycleStatus, ExpenseCategory, Location } from "@/lib/types";

// Language-independent values and helpers. Labels for these values live in the
// message files and are produced by the formatters in i18n/format.ts.

// Amount without sign, e.g. 61900 -> "₹61,900"; callers add +/- where needed
export const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const signedFmt = (n: number) => (n < 0 ? "-" : "+") + fmt(n);

export const AREA_UNITS: { value: AreaUnit }[] = [{ value: "ACRE" }, { value: "HECTARE" }, { value: "BIGHA" }, { value: "KANAL" }];

export const YIELD_UNITS = [{ value: "QTL" }, { value: "TON" }, { value: "KG" }, { value: "MAUND" }];

export function formatLocation(location?: Location) {
  return [location?.village, location?.district, location?.state].filter(Boolean).join(", ");
}

// Whole days from now until the date (negative once it has passed)
export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; emoji: string; color: string }[] = [
  { value: "SEEDS", emoji: "🌱", color: "bg-green-100 text-green-700" },
  { value: "FERTILIZER", emoji: "🧪", color: "bg-blue-100 text-blue-700" },
  { value: "PESTICIDE", emoji: "🪲", color: "bg-orange-100 text-orange-700" },
  { value: "LABOUR", emoji: "👷", color: "bg-purple-100 text-purple-700" },
  { value: "IRRIGATION", emoji: "💧", color: "bg-cyan-100 text-cyan-700" },
  { value: "MACHINERY", emoji: "🚜", color: "bg-gray-100 text-gray-700" },
  { value: "TRANSPORT", emoji: "🚛", color: "bg-pink-100 text-pink-700" },
  { value: "OTHER", emoji: "📦", color: "bg-yellow-100 text-yellow-700" },
];

export const categoryColor = (category: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((c) => c.value === category)?.color ?? "bg-gray-100 text-gray-600";

export const CYCLE_STATUS: Record<CycleStatus, { badge: string; emoji: string }> = {
  PLANNED: { badge: "badge-empty", emoji: "📋" },
  ACTIVE: { badge: "badge-active", emoji: "🌱" },
  HARVESTED: { badge: "badge-yellow", emoji: "🌾" },
  CLOSED: { badge: "badge-empty", emoji: "✅" },
};

// Stored in English on fields and farms; translated for display by i18n/format.ts
export const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Silty", "Clayey Loam", "Black Cotton", "Red Laterite"];
export const IRRIGATION_TYPES = ["Tube Well", "Canal", "Drip", "Sprinkler", "Borewell", "Flood", "River Lift", "Rainwater"];
