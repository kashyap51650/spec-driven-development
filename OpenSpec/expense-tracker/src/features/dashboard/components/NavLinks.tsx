"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import navItems from "@/constants/navigation";
import React from "react";

interface NavLinksProps {
  onNavigate?: () => void;
}

export default function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname() || "/";

  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon as React.ComponentType<
            React.SVGProps<SVGSVGElement>
          >;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate && onNavigate()}
              className={
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ` +
                (isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/50")
              }
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
