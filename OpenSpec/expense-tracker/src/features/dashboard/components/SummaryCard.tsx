import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export default function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconColor = "text-foreground",
  valueColor,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className={`text-2xl font-bold ${valueColor ?? ""}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
