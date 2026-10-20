import { PageSkeleton, PanelSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="settings" narrow>
      <PanelSkeleton lines={4} />
      <PanelSkeleton lines={3} />
    </PageSkeleton>
  );
}
