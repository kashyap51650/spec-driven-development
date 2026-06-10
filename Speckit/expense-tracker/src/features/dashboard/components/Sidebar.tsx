import { Separator } from "@/components/ui/separator";
import AppLogo from "@/components/shared/AppLogo";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export default function Sidebar({ user }: SidebarProps): React.ReactElement {
  return (
    <aside className="hidden md:flex flex-col h-screen w-60 border-r bg-background">
      <div className="px-4 py-5">
        <AppLogo size="md" />
      </div>
      <nav className="flex-1 px-3 py-2 overflow-hidden flex flex-col">
        <NavLinks />
      </nav>
      <div className="px-4 py-3">
        <Separator className="mb-3" />
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
