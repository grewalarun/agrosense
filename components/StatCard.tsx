import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg?: string;
  sub?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, icon: Icon, iconBg = "bg-primary-100", sub, highlight }: StatCardProps) {
  return (
    <div className={`card p-4 ${highlight ? "border-accent-300 bg-accent-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className={`text-xl font-bold mt-0.5 ${highlight ? "text-accent-700" : "text-gray-800"}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className="text-primary-600" />
        </div>
      </div>
    </div>
  );
}
