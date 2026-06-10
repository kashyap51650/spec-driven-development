"use client";

import React, { useState } from "react";
import AppLogo from "@/components/shared/AppLogo";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

export default function MobileHeader({ user }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex md:hidden items-center justify-between p-3 border-b">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button aria-label="Open menu">
            <Menu />
          </button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <div className="p-2">
              <AppLogo size="md" />
            </div>
          </SheetHeader>
          <div className="p-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="p-4">
            <SheetClose asChild>
              <button className="w-full">Close</button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center justify-center">
        <AppLogo size="sm" />
      </div>

      <div>
        <UserMenu user={user} />
      </div>
    </div>
  );
}
