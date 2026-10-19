import { CardGridSkeleton, PageSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Harvests">
      <StatCardsSkeleton />
      <CardGridSkeleton count={3} />
    </PageSkeleton>
  );
}
