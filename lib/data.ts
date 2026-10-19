export type Field = {
  id: string;
  name: string;
  area: number;
  soil: string;
  irrigation: string;
  status: "Active" | "Empty";
  currentCrop?: string;
  currentCycleId?: string;
};

export type Farm = {
  id: string;
  name: string;
  location: string;
  totalArea: number;
  irrigation: string;
  soilType: string;
  season: string;
  fields: Field[];
};

export type CropCycle = {
  id: string;
  farmId: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  season: string;
  startDate: string;
  endDate?: string;
  closedYear?: number; // financial year it closed: 2026 = FY 2025-26 (Apr25–Mar26)
  status: "Active" | "Harvested" | "Planned";
  expectedYield: number;
  actualYield?: number;
  yieldUnit: string;
};

export type Expense = {
  id: string;
  farmId: string;
  fieldId: string;
  fieldName: string;
  cycleId?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export type Harvest = {
  id: string;
  farmId: string;
  fieldId: string;
  fieldName: string;
  cycleId: string;
  crop: string;
  date: string;
  quantity: number;
  unit: string;
  quality: "A" | "B" | "C";
};

export type Sale = {
  id: string;
  farmId: string;
  fieldId: string;
  cycleId: string; // always linked to a specific cycle
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  buyer: string;
  date: string;
};

// ─── Static data ───────────────────────────────────────────────

export const FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "Grewal Farm",
    location: "Moradabad, UP",
    totalArea: 4,
    irrigation: "Tube Well",
    soilType: "Mixed",
    season: "Rabi 2026-27",
    fields: [
      { id: "f1", name: "Field 1", area: 1, soil: "Loamy",     irrigation: "Tube Well", status: "Active", currentCrop: "Potato",    currentCycleId: "cc3" },
      { id: "f2", name: "Field 2", area: 1, soil: "Sandy",     irrigation: "Drip",      status: "Active", currentCrop: "Wheat",     currentCycleId: "cc4" },
      { id: "f3", name: "Field 3", area: 1, soil: "Loamy",     irrigation: "Tube Well", status: "Active", currentCrop: "Sugarcane", currentCycleId: "cc5" },
      { id: "f4", name: "Field 4", area: 1, soil: "Clay",      irrigation: "Canal",     status: "Empty" },
    ],
  },
  {
    id: "farm-2",
    name: "Grewal North Block",
    location: "Sambhal, UP",
    totalArea: 2,
    irrigation: "Canal",
    soilType: "Sandy Loam",
    season: "Rabi 2026-27",
    fields: [
      { id: "f5", name: "Field A", area: 1, soil: "Sandy Loam", irrigation: "Canal", status: "Active", currentCrop: "Mustard", currentCycleId: "cc6" },
      { id: "f6", name: "Field B", area: 1, soil: "Sandy Loam", irrigation: "Canal", status: "Empty" },
    ],
  },
];

// closedYear: the March year of the Indian financial year it closed in
// e.g. closed Mar 2026 → FY 2025-26 → closedYear: 2026
export const CROP_CYCLES: CropCycle[] = [
  // Field 1 history
  { id: "cc-f1-1", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Wheat",  season: "Rabi 2023-24",  startDate: "2023-11-01", endDate: "2024-04-10", closedYear: 2024, status: "Harvested", expectedYield: 32, actualYield: 30, yieldUnit: "Quintal" },
  { id: "cc-f1-2", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Rice",   season: "Kharif 2024",   startDate: "2024-06-15", endDate: "2024-10-20", closedYear: 2025, status: "Harvested", expectedYield: 40, actualYield: 38, yieldUnit: "Quintal" },
  { id: "cc-f1-3", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Wheat",  season: "Rabi 2024-25",  startDate: "2024-11-05", endDate: "2025-04-05", closedYear: 2025, status: "Harvested", expectedYield: 35, actualYield: 34, yieldUnit: "Quintal" },
  { id: "cc-f1-4", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Rice",   season: "Kharif 2025",   startDate: "2025-06-10", endDate: "2025-10-15", closedYear: 2026, status: "Harvested", expectedYield: 42, actualYield: 42, yieldUnit: "Quintal" },
  { id: "cc-f1-5", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Wheat",  season: "Rabi 2025-26",  startDate: "2025-11-01", endDate: "2026-04-08", closedYear: 2026, status: "Harvested", expectedYield: 36, actualYield: 35, yieldUnit: "Quintal" },
  { id: "cc3",     farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", crop: "Potato", season: "Rabi 2026-27",  startDate: "2026-10-15", status: "Active", expectedYield: 120, yieldUnit: "Quintal" },

  // Field 2 history
  { id: "cc-f2-1", farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", crop: "Maize",   season: "Kharif 2024",  startDate: "2024-06-20", endDate: "2024-09-25", closedYear: 2025, status: "Harvested", expectedYield: 28, actualYield: 26, yieldUnit: "Quintal" },
  { id: "cc-f2-2", farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", crop: "Potato",  season: "Rabi 2024-25", startDate: "2024-10-20", endDate: "2025-02-28", closedYear: 2025, status: "Harvested", expectedYield: 90, actualYield: 88, yieldUnit: "Quintal" },
  { id: "cc-f2-3", farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", crop: "Maize",   season: "Kharif 2025",  startDate: "2025-06-18", endDate: "2025-10-02", closedYear: 2026, status: "Harvested", expectedYield: 30, actualYield: 29, yieldUnit: "Quintal" },
  { id: "cc4",     farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", crop: "Wheat",   season: "Rabi 2026-27", startDate: "2026-11-01", status: "Active", expectedYield: 35, yieldUnit: "Quintal" },

  // Field 3 — sugarcane (long cycle crossing FY)
  { id: "cc-f3-1", farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", crop: "Sugarcane", season: "Annual 2023-24", startDate: "2023-03-10", endDate: "2024-02-20", closedYear: 2024, status: "Harvested", expectedYield: 550, actualYield: 540, yieldUnit: "Quintal" },
  { id: "cc-f3-2", farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", crop: "Sugarcane", season: "Annual 2024-25", startDate: "2024-03-15", endDate: "2025-02-10", closedYear: 2025, status: "Harvested", expectedYield: 580, actualYield: 570, yieldUnit: "Quintal" },
  { id: "cc-f3-3", farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", crop: "Sugarcane", season: "Annual 2025-26", startDate: "2025-03-12", endDate: "2026-02-18", closedYear: 2026, status: "Harvested", expectedYield: 600, actualYield: 595, yieldUnit: "Quintal" },
  { id: "cc5",     farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", crop: "Sugarcane", season: "Annual 2026-27", startDate: "2026-03-10", status: "Active", expectedYield: 600, yieldUnit: "Quintal" },

  // Farm 2 Field A
  { id: "cc-f5-1", farmId: "farm-2", fieldId: "f5", fieldName: "Field A", crop: "Mustard", season: "Rabi 2025-26", startDate: "2025-10-20", endDate: "2026-03-05", closedYear: 2026, status: "Harvested", expectedYield: 12, actualYield: 11, yieldUnit: "Quintal" },
  { id: "cc6",     farmId: "farm-2", fieldId: "f5", fieldName: "Field A", crop: "Mustard", season: "Rabi 2026-27", startDate: "2026-10-22", status: "Active", expectedYield: 13, yieldUnit: "Quintal" },
];

// Expenses linked to cycleId
export const EXPENSES: Expense[] = [
  // Field 1 - Potato (cc3) active
  { id: "e1",  farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc3", category: "Seeds",      description: "Potato seeds 50kg",    amount: 4500,  date: "2026-10-15" },
  { id: "e2",  farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc3", category: "Labour",     description: "Planting labour",       amount: 3200,  date: "2026-10-16" },
  { id: "e3",  farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc3", category: "Fertilizer", description: "DAP 50kg",              amount: 2800,  date: "2026-10-20" },
  // Field 2 - Wheat (cc4) active
  { id: "e4",  farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", cycleId: "cc4", category: "Seeds",      description: "Wheat seeds HD-2967",   amount: 2200,  date: "2026-11-02" },
  { id: "e5",  farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", cycleId: "cc4", category: "Fertilizer", description: "Urea 50kg",             amount: 1400,  date: "2026-11-08" },
  // Field 3 - Sugarcane (cc5) active
  { id: "e6",  farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", cycleId: "cc5", category: "Labour",     description: "Planting & earthing",   amount: 5000,  date: "2026-03-12" },
  { id: "e7",  farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", cycleId: "cc5", category: "Irrigation", description: "Diesel for pump",       amount: 1800,  date: "2026-05-10" },
  { id: "e8",  farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", cycleId: "cc5", category: "Fertilizer", description: "Potash fertilizer",     amount: 3200,  date: "2026-07-15" },
  // Closed cycle expenses (Field 1 - Rice cc-f1-4)
  { id: "e9",  farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc-f1-4", category: "Seeds",  description: "Paddy seeds",          amount: 3800,  date: "2025-06-12" },
  { id: "e10", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc-f1-4", category: "Labour", description: "Transplanting",        amount: 4200,  date: "2025-06-18" },
  { id: "e11", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc-f1-4", category: "Pesticide", description: "Herbicide",          amount: 1500,  date: "2025-07-10" },
  // Closed cycle expenses (Field 1 - Wheat cc-f1-5)
  { id: "e12", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc-f1-5", category: "Seeds",  description: "Wheat HD-3086",        amount: 2600,  date: "2025-11-03" },
  { id: "e13", farmId: "farm-1", fieldId: "f1", fieldName: "Field 1", cycleId: "cc-f1-5", category: "Fertilizer", description: "DAP + Urea",       amount: 4100,  date: "2025-11-10" },
  // Closed cycle expenses (Field 2 - Maize cc-f2-3)
  { id: "e14", farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", cycleId: "cc-f2-3", category: "Seeds",  description: "Hybrid maize seeds",   amount: 1800,  date: "2025-06-20" },
  { id: "e15", farmId: "farm-1", fieldId: "f2", fieldName: "Field 2", cycleId: "cc-f2-3", category: "Labour", description: "Harvest labour",       amount: 2200,  date: "2025-09-28" },
  // Closed cycle expenses (Field 3 - Sugarcane cc-f3-3)
  { id: "e16", farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", cycleId: "cc-f3-3", category: "Labour", description: "Cutting & loading",    amount: 8000,  date: "2026-01-20" },
  { id: "e17", farmId: "farm-1", fieldId: "f3", fieldName: "Field 3", cycleId: "cc-f3-3", category: "Fertilizer", description: "Ratoon fertilizer", amount: 3500, date: "2025-08-10" },
];

// Sales always linked to a cycleId
export const SALES: Sale[] = [
  // Field 1 Rice (cc-f1-4) closed FY2026
  { id: "s1", farmId: "farm-1", fieldId: "f1", cycleId: "cc-f1-4", crop: "Rice",      quantity: 42, unit: "Quintal", pricePerUnit: 2200, total: 92400,  buyer: "Moradabad Mandi",   date: "2025-10-18" },
  // Field 1 Wheat (cc-f1-5) closed FY2026
  { id: "s2", farmId: "farm-1", fieldId: "f1", cycleId: "cc-f1-5", crop: "Wheat",     quantity: 35, unit: "Quintal", pricePerUnit: 2150, total: 75250,  buyer: "Govt Procurement",  date: "2026-04-10" },
  // Field 2 Maize (cc-f2-3) closed FY2026
  { id: "s3", farmId: "farm-1", fieldId: "f2", cycleId: "cc-f2-3", crop: "Maize",     quantity: 29, unit: "Quintal", pricePerUnit: 1750, total: 50750,  buyer: "Feed Company",      date: "2025-10-05" },
  // Field 3 Sugarcane (cc-f3-3) closed FY2026 — two cuttings
  { id: "s4", farmId: "farm-1", fieldId: "f3", cycleId: "cc-f3-3", crop: "Sugarcane", quantity: 300, unit: "Quintal", pricePerUnit: 380, total: 114000, buyer: "Sugar Mill A",      date: "2026-01-25" },
  { id: "s5", farmId: "farm-1", fieldId: "f3", cycleId: "cc-f3-3", crop: "Sugarcane", quantity: 295, unit: "Quintal", pricePerUnit: 390, total: 115050, buyer: "Sugar Mill A",      date: "2026-02-20" },
  // Older closed cycles
  { id: "s6", farmId: "farm-1", fieldId: "f1", cycleId: "cc-f1-3", crop: "Wheat",     quantity: 34, unit: "Quintal", pricePerUnit: 2100, total: 71400,  buyer: "Govt Procurement",  date: "2025-04-08" },
  { id: "s7", farmId: "farm-1", fieldId: "f2", cycleId: "cc-f2-2", crop: "Potato",    quantity: 88, unit: "Quintal", pricePerUnit: 1200, total: 105600, buyer: "Local Trader",      date: "2025-03-02" },
];

export const HARVESTS: Harvest[] = [
  { id: "h1", farmId: "farm-1", fieldId: "f1", cycleId: "cc-f1-4", fieldName: "Field 1", crop: "Rice",      date: "2025-10-15", quantity: 42,  unit: "Quintal", quality: "A" },
  { id: "h2", farmId: "farm-1", fieldId: "f1", cycleId: "cc-f1-5", fieldName: "Field 1", crop: "Wheat",     date: "2026-04-08", quantity: 35,  unit: "Quintal", quality: "A" },
  { id: "h3", farmId: "farm-1", fieldId: "f2", cycleId: "cc-f2-3", fieldName: "Field 2", crop: "Maize",     date: "2025-10-02", quantity: 29,  unit: "Quintal", quality: "B" },
  { id: "h4", farmId: "farm-1", fieldId: "f3", cycleId: "cc-f3-3", fieldName: "Field 3", crop: "Sugarcane", date: "2026-02-18", quantity: 595, unit: "Quintal", quality: "A" },
];

// ─── Derived helpers ───────────────────────────────────────────

export function getCycleExpenses(cycleId: string) {
  return EXPENSES.filter(e => e.cycleId === cycleId);
}

export function getCycleSales(cycleId: string) {
  return SALES.filter(s => s.cycleId === cycleId);
}

export function getCyclePL(cycleId: string) {
  const expenses = getCycleExpenses(cycleId).reduce((a, e) => a + e.amount, 0);
  const revenue  = getCycleSales(cycleId).reduce((a, s) => a + s.total, 0);
  return { expenses, revenue, profit: revenue - expenses };
}

// Get the last closed cycle for a field (for dashboard cards)
export function getLastClosedCycle(fieldId: string) {
  return CROP_CYCLES
    .filter(c => c.fieldId === fieldId && c.status === "Harvested")
    .sort((a, b) => (b.endDate ?? "").localeCompare(a.endDate ?? ""))
    [0] ?? null;
}

// Get active cycle for a field
export function getActiveCycle(fieldId: string) {
  return CROP_CYCLES.find(c => c.fieldId === fieldId && c.status === "Active") ?? null;
}

// Annual P&L for a field grouped by financial year (year = the March year)
export function getFieldAnnualPL(fieldId: string) {
  const closedCycles = CROP_CYCLES.filter(c => c.fieldId === fieldId && c.status === "Harvested" && c.closedYear);
  const years = [...new Set(closedCycles.map(c => c.closedYear!))].sort((a, b) => b - a);

  return years.map(year => {
    const cycles = closedCycles.filter(c => c.closedYear === year);
    const pl = cycles.reduce((acc, c) => {
      const { expenses, revenue, profit } = getCyclePL(c.id);
      return { expenses: acc.expenses + expenses, revenue: acc.revenue + revenue, profit: acc.profit + profit };
    }, { expenses: 0, revenue: 0, profit: 0 });
    return { year, label: `FY ${year - 1}–${String(year).slice(2)}`, cycles, ...pl };
  });
}

export const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");

// Sell entries within a harvest (for multi-lot sales)
export type SellEntry = {
  id: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  buyer: string;
  date: string;
};

// Get all sell entries for a cycle (from SALES)
export function getCycleSellEntries(cycleId: string): SellEntry[] {
  return SALES.filter(s => s.cycleId === cycleId).map(s => ({
    id: s.id,
    quantity: s.quantity,
    unit: s.unit,
    pricePerUnit: s.pricePerUnit,
    total: s.total,
    buyer: s.buyer,
    date: s.date,
  }));
}

// Get AI prompt data for a cycle
export function getCycleAIContext(cycleId: string) {
  const cycle = CROP_CYCLES.find(c => c.id === cycleId);
  if (!cycle) return null;
  const farm = FARMS.find(f => f.id === cycle.farmId);
  const field = farm?.fields.find(f => f.id === cycle.fieldId);
  const pl = getCyclePL(cycleId);
  return { cycle, farm, field, pl };
}
