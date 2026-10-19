import TopBar from "@/components/TopBar";

// Building blocks for loading.tsx screens: shimmering placeholders shaped like
// the page that is about to appear, so the layout doesn't jump when data arrives.

export function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />;
}

export function PageSkeleton({ title, children, narrow }: { title: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <TopBar title={title} />
      <main className={`p-4 lg:p-6 space-y-5 ${narrow ? "max-w-2xl" : ""}`}>
        <span className="sr-only">Loading {title.toLowerCase()}…</span>
        {children}
      </main>
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid gap-3 ${count === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-4 space-y-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChipsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: count }, (_, i) => <Bone key={i} className="h-7 w-20 rounded-full flex-shrink-0" />)}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card p-4 flex items-start gap-4">
          <Bone className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Bone className="h-4 w-1/3" />
            <Bone className="h-3 w-1/2" />
          </div>
          <div className="space-y-2 pt-1 flex flex-col items-end">
            <Bone className="h-4 w-16" />
            <Bone className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex justify-between"><Bone className="w-10 h-10 rounded-xl" /><Bone className="h-5 w-16 rounded-full" /></div>
          <Bone className="h-4 w-2/3" />
          <Bone className="h-3 w-1/2" />
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <Bone className="h-8" /><Bone className="h-8" /><Bone className="h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex gap-6">
        {Array.from({ length: cols }, (_, i) => <Bone key={i} className="h-3 flex-1" />)}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="px-4 py-3.5 flex gap-6 border-b border-gray-50 last:border-0">
          {Array.from({ length: cols }, (_, c) => <Bone key={c} className={`h-3 flex-1 ${c === 0 ? "max-w-[30%]" : ""}`} />)}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 180 }: { height?: number }) {
  const bars = [55, 80, 35, 95, 60, 20];
  return (
    <div className="card p-5">
      <Bone className="h-4 w-32 mb-4" />
      <div className="flex items-end gap-6 px-4" style={{ height }}>
        {bars.map((h, i) => <Bone key={i} className="flex-1 max-w-6 rounded-b-none" style={{ height: `${h}%` }} />)}
      </div>
    </div>
  );
}

export function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="card p-5 space-y-3">
      <Bone className="h-4 w-40" />
      {Array.from({ length: lines }, (_, i) => <Bone key={i} className={`h-3 ${i % 2 ? "w-3/4" : "w-full"}`} />)}
    </div>
  );
}
