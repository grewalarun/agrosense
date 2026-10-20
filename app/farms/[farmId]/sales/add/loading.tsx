import { ListSkeleton, PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="chooseCrop" narrow>
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
