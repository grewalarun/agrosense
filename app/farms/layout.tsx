import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { getFarmIds } from "@/lib/api/farms";
import Sidebar from "@/components/Sidebar";

export default async function FarmsLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const farms = await getFarmIds();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar userName={user.name} defaultFarmId={farms[0]?._id ?? null} />
      <div className="lg:pl-56 xl:pl-60">
        <div className="pt-14 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
