import { redirect } from "next/navigation";

import MobileHeader from "@/features/dashboard/components/MobileHeader";
import Sidebar from "@/features/dashboard/components/Sidebar";
import { getUserById } from "@/data/user";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<React.ReactElement> {
  try {
    const user = await getUserById();

    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={{ name: user.name, email: user.email }} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MobileHeader user={{ name: user.name, email: user.email }} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
