"use client";
import Link, { useLinkStatus } from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Sprout, MapPin, RefreshCw, DollarSign,
  Wheat, ShoppingCart, BarChart2, CalendarDays, Settings,
  LogOut, Menu, X, Users, Activity, Mail
} from "lucide-react";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/lib/auth";
import { BrandIcon, Wordmark } from "@/components/Brand";

// Farm-specific links point at the farm being viewed, or the user's first farm.
// Labels are keys in the "nav" messages.
function buildNav(farmId: string | null, isAdmin: boolean) {
  const farmLink = (path: string) => (farmId ? `/farms/${farmId}${path}` : "/farms");
  return [
    { label: "overview" as const, items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "dashboard" as const },
      { href: "/farms", icon: Sprout, label: "myFarms" as const },
    ]},
    ...(farmId ? [
      { label: "crops" as const, items: [
        { href: farmLink("/fields"), icon: MapPin, label: "fields" as const },
        { href: farmLink("/crop-cycles"), icon: RefreshCw, label: "cropCycles" as const },
      ]},
      { label: "finance" as const, items: [
        { href: farmLink("/expenses"), icon: DollarSign, label: "expenses" as const },
        { href: farmLink("/harvests"), icon: Wheat, label: "harvests" as const },
        { href: farmLink("/sales"), icon: ShoppingCart, label: "sales" as const },
      ]},
      { label: "insights" as const, items: [
        { href: farmLink("/reports"), icon: BarChart2, label: "reports" as const },
        { href: farmLink("/planning"), icon: CalendarDays, label: "planning" as const },
      ]},
    ] : []),
    ...(isAdmin ? [
      { label: "admin" as const, items: [
        { href: "/admin", icon: Activity, label: "analytics" as const, exact: true },
        { href: "/admin/users", icon: Users, label: "users" as const },
        { href: "/admin/messages", icon: Mail, label: "messages" as const },
      ]},
    ] : []),
    { label: "account" as const, items: [
      { href: "/settings", icon: Settings, label: "settings" as const },
    ]},
  ];
}

// Small dot that pulses while the link's page is loading
function PendingDot() {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden
      className={`ml-auto w-1.5 h-1.5 rounded-full bg-accent-300 transition-opacity ${pending ? "opacity-100 animate-pulse" : "opacity-0"}`} />
  );
}

// `loading`: rendered as the Suspense fallback while the user's name and farms load
export default function Sidebar({ userName, defaultFarmId, isAdmin = false, loading = false }: {
  userName: string;
  defaultFarmId: string | null;
  isAdmin?: boolean;
  loading?: boolean;
}) {
  const pathname = usePathname();
  const params = useParams();
  const farmId = (params.farmId as string | undefined) ?? defaultFarmId;
  const nav = buildNav(farmId, isAdmin);
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-primary-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <BrandIcon size={28} />
          </div>
          <div className="min-w-0">
            <Wordmark onDark className="text-base leading-none" />
            <div className="text-primary-300 text-xs truncate">{tc("tagline")}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {nav.map(section => (
          <div key={section.label}>
            <p className="text-primary-400 text-xs font-semibold px-3 mb-1 tracking-wider">{t(section.label)}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const exact = "exact" in item && item.exact;
                const active = pathname === item.href || (!exact && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={active ? "sidebar-link-active" : "sidebar-link text-primary-200 hover:bg-primary-700 hover:text-white"}
                  >
                    <item.icon size={16} />
                    {t(item.label)}
                    <PendingDot />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className={`w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center text-primary-800 font-bold text-xs flex-shrink-0 ${loading ? "animate-pulse opacity-60" : ""}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {loading
              ? <div className="h-3.5 w-24 rounded bg-primary-700 animate-pulse mb-1" aria-hidden />
              : <p className="text-white text-sm font-medium truncate">{userName}</p>}
            <p className="text-primary-300 text-xs">{tc("farmOwner")}</p>
          </div>
          <button onClick={handleLogout} className="text-primary-300 hover:text-white transition-colors" title={tc("logout")}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-primary-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <BrandIcon size={24} />
          </div>
          <Wordmark onDark className="text-base" />
        </div>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 left-0 w-64 h-full bg-primary-800">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-primary-800 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
