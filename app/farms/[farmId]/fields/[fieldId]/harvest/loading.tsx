import { Bone, PageSkeleton, PanelSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Harvest & Sell" narrow>
      <div className="flex gap-2">{[0, 1, 2].map(i => <Bone key={i} className="h-7 flex-1 rounded-full" />)}</div>
      <Bone className="h-16 w-full rounded-xl" />
      <PanelSkeleton lines={7} />
    </PageSkeleton>
  );
}
