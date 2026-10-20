import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import TopBar from "@/components/TopBar";

// crop is the display name (already translated); emoji comes from the stored name
export type CropPickerItem = { href: string; crop: string; emoji: string; field: string; detail: string };

// "Which crop?" step used by Record Harvest and Record Sale before the harvest & sell flow
export default async function CropPicker({ title, intro, items, empty, backHref }: {
  title: string;
  intro: string;
  items: CropPickerItem[];
  empty: React.ReactNode;
  backHref: string;
}) {
  const t = await getTranslations("common");
  return (
    <div>
      <TopBar title={title} />
      <main className="p-4 lg:p-6 max-w-lg mx-auto">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-5 transition-colors">
          <ChevronLeft size={16} /> {t("back")}
        </Link>
        <p className="text-sm text-gray-600 mb-3">{intro}</p>
        {items.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-500">{empty}</div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <Link key={item.href} href={item.href} className="card p-4 flex items-center gap-3 hover:border-primary-200 hover:shadow-sm transition-all">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.crop} · {item.field}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
