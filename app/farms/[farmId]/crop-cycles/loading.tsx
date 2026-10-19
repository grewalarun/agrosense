import { Bone, ChipsSkeleton, ListSkeleton, PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Crop Cycles">
      <div className="flex justify-between items-center"><Bone className="h-4 w-32" /><Bone className="h-9 w-28" /></div>
      <ChipsSkeleton />
      <ListSkeleton rows={4} />
    </PageSkeleton>
  );
}
