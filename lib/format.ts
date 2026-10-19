import type { AreaUnit, CycleStatus, ExpenseCategory, Location } from "@/lib/types";

// Amount without sign, e.g. 61900 -> "₹61,900"; callers add +/- where needed
export const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const signedFmt = (n: number) => (n < 0 ? "-" : "+") + fmt(n);

export const AREA_UNITS: { value: AreaUnit; label: string; short: string }[] = [
  { value: "ACRE", label: "Acre", short: "Ac" },
  { value: "HECTARE", label: "Hectare", short: "Ha" },
  { value: "BIGHA", label: "Bigha", short: "Bigha" },
  { value: "KANAL", label: "Kanal", short: "Kanal" },
];

export const areaUnitShort = (unit: AreaUnit) => AREA_UNITS.find((u) => u.value === unit)?.short ?? unit;

export function formatArea(area: number, unit: AreaUnit, long = false) {
  const meta = AREA_UNITS.find((u) => u.value === unit);
  return `${area} ${long ? meta?.label ?? unit : meta?.short ?? unit}`;
}

export function formatLocation(location?: Location) {
  return [location?.village, location?.district, location?.state].filter(Boolean).join(", ");
}

// Dates are stored as UTC midnight, so format in UTC to avoid shifting the day
export function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string; color: string }[] = [
  { value: "SEEDS", label: "Seeds", emoji: "🌱", color: "bg-green-100 text-green-700" },
  { value: "FERTILIZER", label: "Fertilizer", emoji: "🧪", color: "bg-blue-100 text-blue-700" },
  { value: "PESTICIDE", label: "Pesticide", emoji: "🪲", color: "bg-orange-100 text-orange-700" },
  { value: "LABOUR", label: "Labour", emoji: "👷", color: "bg-purple-100 text-purple-700" },
  { value: "IRRIGATION", label: "Irrigation", emoji: "💧", color: "bg-cyan-100 text-cyan-700" },
  { value: "MACHINERY", label: "Machinery / Tractor", emoji: "🚜", color: "bg-gray-100 text-gray-700" },
  { value: "TRANSPORT", label: "Transport", emoji: "🚛", color: "bg-pink-100 text-pink-700" },
  { value: "OTHER", label: "Other", emoji: "📦", color: "bg-yellow-100 text-yellow-700" },
];

export const categoryColor = (category: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((c) => c.value === category)?.color ?? "bg-gray-100 text-gray-600";

export const YIELD_UNITS = [
  { value: "QTL", label: "Quintal", short: "Qtl" },
  { value: "TON", label: "Ton", short: "Ton" },
  { value: "KG", label: "Kg", short: "Kg" },
  { value: "MAUND", label: "Maund", short: "Maund" },
];

export const unitLabel = (unit: string) => YIELD_UNITS.find((u) => u.value === unit)?.short ?? unit;

export const CYCLE_STATUS: Record<CycleStatus, { label: string; badge: string; emoji: string }> = {
  PLANNED: { label: "Planned", badge: "badge-empty", emoji: "📋" },
  ACTIVE: { label: "Active", badge: "badge-active", emoji: "🌱" },
  HARVESTED: { label: "Harvested", badge: "badge-yellow", emoji: "🌾" },
  CLOSED: { label: "Closed", badge: "badge-empty", emoji: "✅" },
};

export const categoryLabel = (category: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;

export const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Silty", "Clayey Loam", "Black Cotton", "Red Laterite"];
export const IRRIGATION_TYPES = ["Tube Well", "Canal", "Drip", "Sprinkler", "Borewell", "Flood", "River Lift", "Rainwater"];
