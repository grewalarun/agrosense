import Link from "next/link";

export type Chip = { label: string; href: string; active: boolean; disabled?: boolean; title?: string };

// Row of link chips for page filters (the selection lives in the URL)
export default function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const base = "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors";
        if (chip.disabled) {
          return <span key={chip.label} title={chip.title} className={`${base} border-gray-100 text-gray-300 cursor-not-allowed`}>{chip.label}</span>;
        }
        return (
          <Link key={chip.label} href={chip.href}
            className={`${base} ${chip.active ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
