import { PageSkeleton, TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <PageSkeleton titleKey="adminUsers">
      <TableSkeleton rows={8} cols={6} />
    </PageSkeleton>
  );
}
