import { CardGridSkeleton, PageSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="harvests">
      <StatCardsSkeleton />
      <CardGridSkeleton count={3} />
    </PageSkeleton>
  );
}
