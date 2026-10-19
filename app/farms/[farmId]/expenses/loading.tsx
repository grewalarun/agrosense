import { ChipsSkeleton, PageSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Expenses">
      <StatCardsSkeleton />
      <ChipsSkeleton count={7} />
      <TableSkeleton rows={6} cols={5} />
    </PageSkeleton>
  );
}
