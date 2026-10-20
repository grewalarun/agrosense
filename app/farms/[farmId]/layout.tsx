"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { MapPin, RefreshCw, DollarSign, Wheat, ShoppingCart, BarChart2, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";

const TABS = [
  { href: "", label: "overview", icon: LayoutDashboard },
  { href: "/fields", label: "fields", icon: MapPin },
  { href: "/crop-cycles", label: "crops", icon: RefreshCw },
  { href: "/expenses", label: "expenses", icon: DollarSign },
  { href: "/harvests", label: "harvests", icon: Wheat },
  { href: "/sales", label: "sales", icon: ShoppingCart },
  { href: "/reports", label: "reports", icon: BarChart2 },
] as const;

export default function FarmDetailLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const farmId = params.farmId as string;
  const base = `/farms/${farmId}`;
  const t = useTranslations("farmTabs");

  return (
    <div>
      <div className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-4 lg:px-6">
          {TABS.map(tab => {
            const href = base + tab.href;
            const active = tab.href === "" ? pathname === base : pathname.startsWith(href);
            return (
              <Link key={tab.href} href={href}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                <tab.icon size={13} />
                {t(tab.label)}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
