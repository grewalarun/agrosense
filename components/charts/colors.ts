// Chart colours. Profit/loss pair validated with the dataviz palette checker
// (light surface): CVD ΔE 10.3, both >= 3:1 contrast. Loss is also encoded by
// direction (below the zero line) and a signed label, never by colour alone.
export const CHART = {
  profit: "#16a34a",
  loss: "#be185d",
  grid: "#e5e7eb",
  axisText: "#6b7280",
};

// Categorical series colours in fixed order (blue, orange, aqua), validated with the
// dataviz palette checker on a light surface: CVD ΔE 9.2, normal-vision ΔE 27.6.
// Aqua is below 3:1 contrast, so every chart using it also shows a legend with totals.
export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a"];
