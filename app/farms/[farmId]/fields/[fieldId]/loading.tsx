import { Bone, ChartSkeleton, PageSkeleton, PanelSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Field">
      <div className="space-y-2"><Bone className="h-5 w-40" /><Bone className="h-3 w-64" /></div>
      <StatCardsSkeleton />
      <div className="grid lg:grid-cols-2 gap-4"><PanelSkeleton lines={6} /><PanelSkeleton lines={6} /></div>
      <ChartSkeleton height={90} />
    </PageSkeleton>
  );
}
