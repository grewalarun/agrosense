import { PageSkeleton, PanelSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="crop" narrow>
      <PanelSkeleton lines={3} />
      <StatCardsSkeleton />
      <PanelSkeleton lines={6} />
    </PageSkeleton>
  );
}
