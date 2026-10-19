import { ListSkeleton, PageSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton title="Choose a crop" narrow>
      <ListSkeleton rows={3} />
    </PageSkeleton>
  );
}
