import { PageSkeleton, TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="adminMessages">
      <TableSkeleton rows={6} cols={5} />
    </PageSkeleton>
  );
}
