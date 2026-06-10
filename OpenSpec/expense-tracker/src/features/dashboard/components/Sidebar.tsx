import AppLogo from "@/components/shared/AppLogo";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-60 h-screen border-r">
      <div className="p-4">
        <AppLogo size="md" />
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <NavLinks />
      </div>
      <div className="p-4">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
