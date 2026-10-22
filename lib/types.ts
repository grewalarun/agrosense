// Shapes returned by the AgriBiz backend

export type AreaUnit = "ACRE" | "HECTARE" | "BIGHA" | "KANAL";
export type SeasonType = "RABI" | "KHARIF" | "ZAID" | "ANNUAL";
export type CycleStatus = "PLANNED" | "ACTIVE" | "HARVESTED" | "CLOSED";
export type ExpenseCategory =
  | "SEEDS" | "FERTILIZER" | "PESTICIDE" | "LABOUR"
  | "IRRIGATION" | "MACHINERY" | "TRANSPORT" | "OTHER";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language?: string;
  // false for accounts that only sign in with Google
  hasPassword?: boolean;
  hasGoogle?: boolean;
  role?: "user" | "superadmin";
  emailOptOut?: boolean;
  createdOn: string;
};

// Responses of the super-admin API (/api/admin/*)
export type AdminPlatform = "web" | "android" | "ios";

export type AdminOverview = {
  range: { from: string; to: string };
  users: { total: number; new: number; active: number; disabled: number };
  farms: number;
  fields: number;
  crops: number;
  cyclesByStatus: Record<string, number>;
  area: { unit: string; area: number }[];
  expenses: { amount: number; count: number };
  harvests: { unit: string; quantity: number; count: number }[];
  sales: { revenue: number; count: number };
};

export type AdminSignups = { days: { date: string; total: number; google: number; password: number }[] };
export type AdminActivity = { days: { date: string; expenses: number; harvests: number; sales: number }[] };
export type AdminBreakdownRow = { label: string; count: number };
export type AdminBreakdowns = {
  crops: AdminBreakdownRow[];
  seasons: AdminBreakdownRow[];
  languages: AdminBreakdownRow[];
  states: AdminBreakdownRow[];
  districts: AdminBreakdownRow[];
};
export type AdminPlatforms = {
  users: Record<AdminPlatform | "unknown", number>;
  appVersions: { platform: string; version: string; count: number }[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language?: string;
  status: "enabled" | "disabled";
  isAdmin: boolean;
  emailOptOut: boolean;
  signIn: ("password" | "google")[];
  platform?: AdminPlatform;
  farms: number;
  lastActiveAt?: string;
  lastRecordAt?: string;
  createdOn: string;
};
export type AdminUserList = { page: number; limit: number; total: number; users: AdminUser[] };

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

// Admin email messages (/api/admin/messages)
export type MessageStatus = "DRAFT" | "SENDING" | "SENT" | "PARTIAL" | "FAILED";
export type MessageAudience =
  | { type: "all" }
  | { type: "users"; userIds: string[] }
  | { type: "group"; language?: string; state?: string; hasActiveCycle?: boolean; signedUpWithinDays?: number };
export type AdminMessage = {
  id: string;
  channels: string[];
  subject: string;
  body: string;
  audience: MessageAudience;
  status: MessageStatus;
  targeted: number;
  sent: number;
  failed: number;
  pending: number;
  createdAt: string;
  sentAt?: string;
};
export type AdminMessageList = { page: number; limit: number; total: number; dailyCap: number; sentToday: number; messages: AdminMessage[] };
export type AudiencePreview = { count: number; sample: { name: string; email: string }[]; dailyCap: number; sentToday: number };
