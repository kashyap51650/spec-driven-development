import { Wallet } from "lucide-react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: "h-4 w-4", text: "text-sm font-semibold" },
  md: { icon: "h-5 w-5", text: "text-base font-semibold" },
  lg: { icon: "h-6 w-6", text: "text-lg font-bold" },
} as const;

export default function AppLogo({ size = "md" }: AppLogoProps): React.ReactElement {
  const { icon, text } = sizeMap[size];
  return (
    <div className="flex items-center gap-2">
      <Wallet className={icon} />
      <span className={text}>Expense Tracker</span>
    </div>
  );
}
