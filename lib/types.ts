// Shapes returned by the AgriBiz backend

export type AreaUnit = "ACRE" | "HECTARE" | "BIGHA" | "KANAL";
export type SeasonType = "RABI" | "KHARIF" | "ZAID" | "ANNUAL";
export type CycleStatus = "PLANNED" | "ACTIVE" | "HARVESTED" | "CLOSED";
export type ExpenseCategory =
  | "SEEDS" | "FERTILIZER" | "PESTICIDE" | "LABOUR"
  | "IRRIGATION" | "MACHINERY" | "TRANSPORT" | "OTHER";

export type Location = { village?: string; district?: string; state?: string; pincode?: string };

export type Farm = {
  _id: string;
  name: string;
  location?: Location;
  totalArea: number;
  areaUnit: AreaUnit;
  irrigationType?: string;
  soilType?: string;
  notes?: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
};

export type Field = {
  _id: string;
  farmId: string;
  name: string;
  area: number;
  areaUnit: AreaUnit;
  soilType?: string;
  irrigationType?: string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE";
};

export type Crop = {
  _id: string;
  name: string;
  localName?: string;
  defaultUnit: string;
  active: boolean;
};

// GET /cycles/:id, with crop and field populated
export type CropCycle = {
  _id: string;
  farmId: string;
  fieldId: { _id: string; name: string; area: number; areaUnit: AreaUnit; soilType?: string; irrigationType?: string };
  cropId: { _id: string; name: string; localName?: string };
  seasonType: SeasonType;
  seasonYear: string;
  season: string;
  status: CycleStatus;
  startDate: string;
  endDate?: string;
  expectedHarvestDate?: string;
  expectedYield?: number;
  yieldUnit: string;
  variety?: string;
  notes?: string;
};

export type Expense = {
  _id: string;
  cycleId: string;
  fieldId: string;
  farmId: string;
  category: ExpenseCategory;
  description?: string;
  notes?: string;
  amount: number;
  date: string;
};

// GET /expenses, with field and the cycle's crop populated
export type ExpenseListItem = Omit<Expense, "fieldId" | "cycleId"> & {
  fieldId: { _id: string; name: string } | null;
  cycleId: { _id: string; seasonType: SeasonType; seasonYear: string; status: CycleStatus; cropId: { name: string } | null } | null;
};

export type Sale = {
  _id: string;
  cycleId: string;
  harvestId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  buyer?: string;
  date: string;
};

export type HarvestQuality = "A" | "B" | "C";

export type Harvest = {
  _id: string;
  cycleId: string;
  fieldId: string;
  farmId: string;
  quantity: number;
  unit: string;
  quality?: HarvestQuality;
  date: string;
  notes?: string;
  soldQuantity: number;
  remainingQuantity: number;
};

// GET /harvests and /sales, with crop and field populated
export type HarvestListItem = Omit<Harvest, "fieldId"> & {
  cropId: { _id: string; name: string } | null;
  fieldId: { _id: string; name: string } | null;
};

export type SaleListItem = Omit<Sale, never> & {
  fieldId: { _id: string; name: string } | null;
  cropId: { _id: string; name: string } | null;
};

export type HarvestTotals = Record<string, { quantity: number; sold: number; remaining: number }>;

// One crop cycle's profit & loss, as returned by the report endpoints
export type CycleRow = {
  cycleId: string;
  farmId: string;
  crop: { _id: string; name: string; localName?: string } | null;
  field: { _id: string; name: string; area: number; areaUnit: AreaUnit } | null;
  seasonType: SeasonType;
  seasonYear: string;
  season: string;
  status: CycleStatus;
  startDate: string;
  endDate?: string;
  expectedHarvestDate?: string;
  variety?: string;
  expenses: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  revenue: number;
  profit: number;
  profitPerArea: number | null;
  expectedYield: number | null;
  actualYield: number;
  yieldUnit: string;
  yieldPerArea: number | null;
  harvested: HarvestTotals;
  soldQuantity: number;
  averageSalePrice: number | null;
};

export type ReportTotals = {
  cycles: number;
  area: number | null;
  areaUnit: AreaUnit | null;
  expenses: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  revenue: number;
  profit: number;
  profitPerArea: number | null;
};

export type FarmCard = {
  farm: Farm;
  fieldCount: number;
  activeCycles: number;
  activeInvestment: number;
  lastCompletedCycle: CycleRow | null;
  totals: ReportTotals;
};

export type FieldSummary = {
  field: Field;
  activeCycle: CycleRow | null;
  plannedCycles: CycleRow[];
  lastCompletedCycle: CycleRow | null;
  totals: ReportTotals;
};

export type FarmReport = {
  farm: Farm;
  activeCycles: number;
  activeInvestment: number;
  totals: ReportTotals;
  fields: FieldSummary[];
};

export type FieldReport = {
  field: { _id: string; name: string; area: number; areaUnit: AreaUnit };
  totals: ReportTotals;
  cycles: CycleRow[];
};
