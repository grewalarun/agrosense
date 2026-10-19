import { PageSkeleton, PanelSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Loading form…" narrow>
      <PanelSkeleton lines={4} />
      <PanelSkeleton lines={5} />
    </PageSkeleton>
  );
}
