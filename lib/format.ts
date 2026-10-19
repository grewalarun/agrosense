import type { AreaUnit, ExpenseCategory, Location } from "@/lib/types";

// Amount without sign, e.g. 61900 -> "₹61,900"; callers add +/- where needed
export const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const signedFmt = (n: number) => (n < 0 ? "-" : "+") + fmt(n);

export const AREA_UNITS: { value: AreaUnit; label: string; short: string }[] = [
  { value: "ACRE", label: "Acre", short: "Ac" },
  { value: "HECTARE", label: "Hectare", short: "Ha" },
  { value: "BIGHA", label: "Bigha", short: "Bigha" },
  { value: "KANAL", label: "Kanal", short: "Kanal" },
];

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

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "SEEDS", label: "Seeds" },
  { value: "FERTILIZER", label: "Fertilizer" },
  { value: "PESTICIDE", label: "Pesticide" },
  { value: "LABOUR", label: "Labour" },
  { value: "IRRIGATION", label: "Irrigation" },
  { value: "MACHINERY", label: "Machinery / Tractor" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "OTHER", label: "Other" },
];

export const categoryLabel = (category: ExpenseCategory) =>
  EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;

export const SOIL_TYPES = ["Loamy", "Sandy", "Clay", "Sandy Loam", "Silty", "Clayey Loam", "Black Cotton", "Red Laterite"];
export const IRRIGATION_TYPES = ["Tube Well", "Canal", "Drip", "Sprinkler", "Borewell", "Flood", "River Lift", "Rainwater"];
