import { Bone, ListSkeleton, PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Fields">
      <div className="flex justify-between items-center"><Bone className="h-4 w-40" /><Bone className="h-9 w-28" /></div>
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
