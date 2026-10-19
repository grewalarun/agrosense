import { Bone, CardGridSkeleton, ChartSkeleton, PageSkeleton, PanelSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Dashboard">
      <div className="rounded-xl p-4 bg-primary-600/90 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-primary-400/70 animate-pulse" />
          <div className="h-5 w-40 rounded bg-primary-400/70 animate-pulse" />
          <div className="h-3 w-32 rounded bg-primary-400/70 animate-pulse" />
        </div>
        <div className="w-14 h-14 rounded-full bg-primary-500 animate-pulse" />
      </div>
      <StatCardsSkeleton />
      <Bone className="h-14 w-full rounded-xl" />
      <div className="grid lg:grid-cols-2 gap-4">
        <PanelSkeleton lines={4} />
        <ChartSkeleton height={150} />
      </div>
      <CardGridSkeleton count={2} />
    </PageSkeleton>
  );
}
