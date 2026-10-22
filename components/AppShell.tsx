import { Suspense } from "react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getUser } from "@/lib/dal";
import { getFarmIds } from "@/lib/api/farms";
import { getMe } from "@/lib/api/account";
import { ApiError } from "@/lib/dal";

// Loads the sidebar's data (user name, first farm for farm links) on its own, so
// the page below can show its loading skeleton immediately instead of waiting.
async function LoadedSidebar() {
  const user = await getUser();
  if (!user) redirect("/login");
  // The role only decides whether the Admin links show; the backend checks it for real
  const [farms, me] = await Promise.all([
    getFarmIds(),
    getMe().catch((error) => {
      if (error instanceof ApiError) return null;
      throw error;
    }),
  ]);
  return <Sidebar userName={user.name} defaultFarmId={farms[0]?._id ?? null} isAdmin={me?.role === "superadmin"} />;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Suspense fallback={<Sidebar userName="" defaultFarmId={null} loading />}>
        <LoadedSidebar />
      </Suspense>
      <div className="lg:pl-56 xl:pl-60">
        <div className="pt-14 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
