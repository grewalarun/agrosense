import type { SeasonType } from "@/lib/types";

// Suggestions shown when planting; picking one creates it in the user's crop list if needed
export const COMMON_CROPS: { name: string; emoji: string; season: SeasonType }[] = [
  { name: "Wheat", emoji: "🌾", season: "RABI" },
  { name: "Rice", emoji: "🍚", season: "KHARIF" },
  { name: "Potato", emoji: "🥔", season: "RABI" },
  { name: "Sugarcane", emoji: "🎋", season: "ANNUAL" },
  { name: "Mustard", emoji: "🌼", season: "RABI" },
  { name: "Maize", emoji: "🌽", season: "KHARIF" },
  { name: "Cotton", emoji: "☁️", season: "KHARIF" },
  { name: "Soybean", emoji: "🫘", season: "KHARIF" },
  { name: "Tomato", emoji: "🍅", season: "ZAID" },
  { name: "Onion", emoji: "🧅", season: "RABI" },
  { name: "Garlic", emoji: "🧄", season: "RABI" },
  { name: "Pea", emoji: "🫛", season: "RABI" },
  { name: "Chickpea", emoji: "🫘", season: "RABI" },
  { name: "Sunflower", emoji: "🌻", season: "ZAID" },
  { name: "Groundnut", emoji: "🥜", season: "KHARIF" },
];

export const cropEmoji = (name?: string) =>
  COMMON_CROPS.find((c) => c.name.toLowerCase() === name?.toLowerCase())?.emoji ?? "🌿";
