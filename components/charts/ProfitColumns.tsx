"use client";
import { useState } from "react";
import { CHART } from "./colors";
import { fmt, signedFmt } from "@/lib/format";

export type ProfitPoint = { label: string; profit: number; revenue: number; expenses: number };

const HEIGHT = 160;
const BAR = 24;

// Profit per period as columns above (profit) or below (loss) a zero line.
// Oldest on the left; the latest value and the hovered/focused column are labelled.
export default function ProfitColumns({ points }: { points: ProfitPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (points.length === 0) return null;

  const max = Math.max(...points.map(p => p.profit), 0);
  const min = Math.min(...points.map(p => p.profit), 0);
  const span = max - min || 1;
  const zeroY = (max / span) * HEIGHT;
  const shown = active ?? points.length - 1;
  const point = points[shown];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 min-h-[2.5rem]">
        <div>
          <p className="text-xs text-gray-500">{point.label}{active === null && points.length > 1 ? " (latest)" : ""}</p>
          <p className="text-lg font-bold text-gray-800">{signedFmt(point.profit)}</p>
        </div>
        <p className="text-xs text-gray-500 text-right">
          Revenue {fmt(point.revenue)}<br />Expenses {fmt(point.expenses)}
        </p>
      </div>
      <div className="relative" style={{ height: HEIGHT }} onMouseLeave={() => setActive(null)}>
        <div className="absolute left-0 right-0" style={{ top: zeroY, borderTop: `1px solid ${CHART.grid}` }} />
        <div className="absolute inset-0 flex items-stretch gap-0.5">
          {points.map((p, i) => {
            const h = Math.max((Math.abs(p.profit) / span) * HEIGHT, p.profit === 0 ? 0 : 2);
            const up = p.profit >= 0;
            return (
              <button key={p.label} type="button"
                className="relative flex-1 outline-none focus-visible:bg-gray-100 rounded"
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                aria-label={`${p.label}: ${signedFmt(p.profit)} (revenue ${fmt(p.revenue)}, expenses ${fmt(p.expenses)})`}>
                <span className="absolute left-1/2 -translate-x-1/2 transition-opacity"
                  style={{
                    width: BAR,
                    height: h,
                    top: up ? zeroY - h : zeroY,
                    background: up ? CHART.profit : CHART.loss,
                    borderRadius: up ? "4px 4px 0 0" : "0 0 4px 4px",
                    opacity: active === null || active === i ? 1 : 0.45,
                  }} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-0.5 mt-1.5">
        {points.map((p, i) => (
          <p key={p.label} className={`flex-1 text-center text-[10px] leading-tight ${i === shown ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
            {p.label}
          </p>
        ))}
      </div>
    </div>
  );
}
