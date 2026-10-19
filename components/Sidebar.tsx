"use client";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Sprout, MapPin, RefreshCw, DollarSign,
  Wheat, ShoppingCart, BarChart2, CalendarDays, Settings,
  LogOut, Menu, X, Leaf
} from "lucide-react";
import { logoutAction } from "@/lib/auth";

// Farm-specific links point at the farm being viewed, or the user's first farm
function buildNav(farmId: string | null) {
  const farmLink = (path: string) => (farmId ? `/farms/${farmId}${path}` : "/farms");
  return [
    { label: "OVERVIEW", items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/farms", icon: Sprout, label: "My Farms" },
    ]},
    ...(farmId ? [
      { label: "CROPS", items: [
        { href: farmLink("/fields"), icon: MapPin, label: "Fields" },
        { href: farmLink("/crop-cycles"), icon: RefreshCw, label: "Crop Cycles" },
      ]},
      { label: "FINANCE", items: [
        { href: farmLink("/expenses"), icon: DollarSign, label: "Expenses" },
        { href: farmLink("/harvests"), icon: Wheat, label: "Harvests" },
        { href: farmLink("/sales"), icon: ShoppingCart, label: "Sales" },
      ]},
      { label: "INSIGHTS", items: [
        { href: farmLink("/reports"), icon: BarChart2, label: "Reports" },
        { href: farmLink("/planning"), icon: CalendarDays, label: "Planning" },
      ]},
    ] : []),
    { label: "ACCOUNT", items: [
      { href: "/settings", icon: Settings, label: "Settings" },
    ]},
  ];
}

export default function Sidebar({ userName, defaultFarmId }: { userName: string; defaultFarmId: string | null }) {
  const pathname = usePathname();
  const params = useParams();
  const farmId = (params.farmId as string | undefined) ?? defaultFarmId;
  const nav = buildNav(farmId);
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
          <div className="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-primary-800" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">AgroSense</div>
            <div className="text-primary-300 text-xs">Farm Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {nav.map(section => (
          <div key={section.label}>
            <p className="text-primary-400 text-xs font-semibold px-3 mb-1 tracking-wider">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={active ? "sidebar-link-active" : "sidebar-link text-primary-200 hover:bg-primary-700 hover:text-white"}
                  >
                    <item.icon size={16} />
                    {item.label}
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
          <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center text-primary-800 font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-primary-300 text-xs">Farm Owner</p>
          </div>
          <button onClick={handleLogout} className="text-primary-300 hover:text-white transition-colors" title="Logout">
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
          <div className="w-7 h-7 bg-accent-400 rounded-lg flex items-center justify-center">
            <Leaf size={14} className="text-primary-800" />
          </div>
          <span className="text-white font-bold text-sm">AgroSense</span>
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
