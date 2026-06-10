import { Wallet } from "lucide-react";

type Size = "sm" | "md" | "lg";

export default function AppLogo({ size = "md" }: { size?: Size }) {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  return (
    <div className="flex items-center gap-3">
      <Wallet className={`size-${iconSize}`} />
      <span className={`font-heading font-medium ${textSize}`}>
        Expense Tracker
      </span>
    </div>
  );
}
