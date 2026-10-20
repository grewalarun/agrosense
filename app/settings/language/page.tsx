import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { CheckCircle2 } from "lucide-react";

const LANGUAGES = [
  { label: "English", native: "English", available: true },
  { label: "Hindi", native: "हिन्दी", available: false },
  { label: "Punjabi", native: "ਪੰਜਾਬੀ", available: false },
];

const REGION = [
  { label: "Country", value: "India 🇮🇳" },
  { label: "Currency", value: "₹ Indian Rupee (INR)" },
  { label: "Number format", value: "1,00,000 (lakh / crore)" },
  { label: "Date format", value: "19 Oct 2026" },
  { label: "Area units", value: "Acre, Hectare, Bigha or Kanal — chosen per farm and field" },
  { label: "Yield units", value: "Quintal, Ton, Kg or Maund — chosen per crop" },
  { label: "Seasons", value: "Rabi, Kharif, Zaid and Annual" },
];

export default function LanguagePage() {
  return (
    <div>
      <TopBar title="Language & Region" />
      <main className="p-4 lg:p-6 max-w-lg space-y-5">
        <BackLink href="/settings" label="Back to Settings" />

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Language</p>
          <div className="card overflow-hidden">
            {LANGUAGES.map((lang, i) => (
              <div key={lang.label} className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-gray-50" : ""} ${lang.available ? "" : "opacity-60"}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{lang.native}</p>
                  {lang.native !== lang.label && <p className="text-xs text-gray-400">{lang.label}</p>}
                </div>
                {lang.available
                  ? <span className="flex items-center gap-1 text-xs font-medium text-primary-700"><CheckCircle2 size={15} /> Selected</span>
                  : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Region</p>
          <div className="card divide-y divide-gray-50">
            {REGION.map(r => (
              <div key={r.label} className="flex justify-between gap-4 p-4">
                <span className="text-sm text-gray-500 whitespace-nowrap">{r.label}</span>
                <span className="text-sm font-medium text-gray-700 text-right">{r.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 px-1 mt-2">More languages and regional settings will be added in a future update.</p>
        </div>
      </main>
    </div>
  );
}
