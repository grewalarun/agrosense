import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getMe } from "@/lib/api/account";

// Only super admins see these pages. This hides them (404); the /api/admin endpoints
// check the role again on the backend.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (me.role !== "superadmin") notFound();
  return <AppShell>{children}</AppShell>;
}
