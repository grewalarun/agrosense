import { PageSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="sales">
      <StatCardsSkeleton />
      <TableSkeleton rows={6} cols={6} />
    </PageSkeleton>
  );
}
