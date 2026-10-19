import { CHART } from "./colors";

export type BarItem = { label: string; value: number; display: string; sub?: string };

// Labelled horizontal bars, largest first. With any negative value the bars grow
// either way from a centre zero line (profit right, loss left); otherwise from the left.
export default function BarList({ items, color = CHART.profit }: { items: BarItem[]; color?: string }) {
  const diverging = items.some(i => i.value < 0);
  const max = Math.max(...items.map(i => Math.abs(i.value)), 1);

  return (
    <div className="space-y-3">
      {items.map(item => {
        const pct = (Math.abs(item.value) / max) * (diverging ? 50 : 100);
        const fill = diverging ? (item.value < 0 ? CHART.loss : CHART.profit) : color;
        return (
          <div key={item.label} title={`${item.label}: ${item.display}`}>
            <div className="flex justify-between gap-3 text-xs mb-1">
              <span className="text-gray-700 font-medium truncate">{item.label}{item.sub && <span className="text-gray-400 font-normal"> · {item.sub}</span>}</span>
              <span className="text-gray-800 font-semibold whitespace-nowrap tabular-nums">{item.display}</span>
            </div>
            <div className="relative h-2.5">
              {diverging && <div className="absolute top-[-3px] bottom-[-3px] left-1/2" style={{ borderLeft: `1px solid ${CHART.grid}` }} />}
              <div className="absolute top-0 h-full"
                style={{
                  background: fill,
                  width: `${pct}%`,
                  ...(diverging
                    ? item.value < 0
                      ? { right: "50%", borderRadius: "4px 0 0 4px" }
                      : { left: "50%", borderRadius: "0 4px 4px 0" }
                    : { left: 0, borderRadius: "0 4px 4px 0" }),
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
