import { CHART } from "./colors";

export type LineSeries = { label: string; color: string; values: number[] };

const W = 640;
const H = 180;
const PAD = { top: 10, right: 8, bottom: 22, left: 30 };

// Round the top of the y-axis up to 1, 2, 5 or 10 times a power of ten
function niceMax(max: number) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 5, 10].find((m) => m * pow >= max)! * pow;
  return step;
}

// Daily lines with a legend that doubles as the totals, plus a hover column per day
// (native tooltip, so it needs no client JavaScript). `dates` are "yyyy-mm-dd".
export default function LineChart({ dates, series, formatDate }: {
  dates: string[];
  series: LineSeries[];
  formatDate: (date: string) => string;
}) {
  const max = niceMax(Math.max(...series.flatMap((s) => s.values), 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (dates.length < 2 ? innerW / 2 : (i / (dates.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelAt = [0, Math.floor((dates.length - 1) / 2), dates.length - 1];
  const colW = innerW / Math.max(dates.length - 1, 1);

  return (
    <div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-gray-600">
        {series.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: s.color, height: 3 }} aria-hidden />
            {s.label} <span className="font-semibold text-gray-800 tabular-nums">{s.values.reduce((a, b) => a + b, 0).toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
        aria-label={series.map((s) => s.label).join(", ")}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={CHART.grid} strokeWidth={1} />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill={CHART.axisText}>{Math.round(t)}</text>
          </g>
        ))}
        {labelAt.map((i, n) => (
          <text key={i} x={x(i)} y={H - 6} fontSize={10} fill={CHART.axisText}
            textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"}>{formatDate(dates[i])}</text>
        ))}
        {series.map((s) => (
          <polyline key={s.label} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        ))}
        {dates.map((date, i) => (
          <rect key={date} x={x(i) - colW / 2} y={PAD.top} width={colW} height={innerH} fill="transparent">
            <title>{`${formatDate(date)}\n${series.map((s) => `${s.label}: ${s.values[i]}`).join("\n")}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}
