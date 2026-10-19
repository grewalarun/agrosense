import { ChartSkeleton, ChipsSkeleton, PageSkeleton, PanelSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Reports">
      <ChipsSkeleton />
      <div className="card p-5"><StatCardsSkeleton count={4} /></div>
      <ChartSkeleton />
      <TableSkeleton rows={5} cols={7} />
      <div className="grid lg:grid-cols-2 gap-4"><PanelSkeleton lines={5} /><PanelSkeleton lines={5} /></div>
    </PageSkeleton>
  );
}
