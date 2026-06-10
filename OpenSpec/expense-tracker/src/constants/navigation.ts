import {
  type LucideIcon,
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: ArrowDownCircle },
  { label: "Income", href: "/income", icon: ArrowUpCircle },
];

export default navItems;
