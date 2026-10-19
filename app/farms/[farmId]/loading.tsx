import { Bone, PageSkeleton, PanelSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Loading farm…">
      <PanelSkeleton lines={2} />
      <div className="grid sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => <Bone key={i} className="h-28 rounded-xl" />)}
      </div>
    </PageSkeleton>
  );
}
