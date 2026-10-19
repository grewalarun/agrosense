"use client";
import { Bell, Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  season?: string;
  action?: { label: string; onClick: () => void };
}

export default function TopBar({ title, season = "Rabi 2026-27", action }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-full">
          🌾 {season}
        </span>
        {action && (
          <button onClick={action.onClick} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-400 rounded-full" />
        </button>
      </div>
    </header>
  );
}
