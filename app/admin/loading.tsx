import { Bone, PageSkeleton, StatCardsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="admin">
      <StatCardsSkeleton count={4} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Bone className="h-56 rounded-xl" />
        <Bone className="h-56 rounded-xl" />
      </div>
    </PageSkeleton>
  );
}
