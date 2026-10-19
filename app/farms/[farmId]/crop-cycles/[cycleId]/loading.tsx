import { PageSkeleton, PanelSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Crop" narrow>
      <PanelSkeleton lines={3} />
      <StatCardsSkeleton />
      <PanelSkeleton lines={6} />
    </PageSkeleton>
  );
}
