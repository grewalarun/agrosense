import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import Sidebar from "@/components/Sidebar";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar userName={user.name} />
      <div className="lg:pl-56 xl:pl-60">
        <div className="pt-14 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
