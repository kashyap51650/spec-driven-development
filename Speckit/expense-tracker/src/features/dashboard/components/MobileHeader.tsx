"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import AppLogo from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";

interface MobileHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

export default function MobileHeader({ user }: MobileHeaderProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex md:hidden h-14 border-b bg-background items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AppLogo size="sm" />
        <UserMenu user={user} />
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex flex-col h-full w-60 p-0">
          <div className="p-4">
            <AppLogo size="md" />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col px-3">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
