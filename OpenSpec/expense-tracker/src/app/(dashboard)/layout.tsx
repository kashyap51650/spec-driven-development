import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/features/dashboard/components/Sidebar";
import MobileHeader from "@/features/dashboard/components/MobileHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = {
    name: (session.name as string) || "",
    email: (session.email as string) || "",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
