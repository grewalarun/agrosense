// Season currently being sown, for display: Rabi Oct–Feb, Zaid Mar–May, Kharif Jun–Sep.
// Matches the backend's season year rules ("Rabi 2026-27", "Kharif 2026").
export function currentSeasonLabel(date = new Date()) {
  const month = date.getMonth(); // 0 = Jan
  const year = date.getFullYear();
  if (month >= 9) return `Rabi ${year}-${String(year + 1).slice(-2)}`;
  if (month <= 1) return `Rabi ${year - 1}-${String(year).slice(-2)}`;
  if (month <= 4) return `Zaid ${year}`;
  return `Kharif ${year}`;
}
