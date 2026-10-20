import { Bone, CardGridSkeleton, PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="myFarms">
      <div className="flex justify-between items-center"><Bone className="h-10 w-40" /><Bone className="h-9 w-28" /></div>
      <CardGridSkeleton count={3} />
    </PageSkeleton>
  );
}
