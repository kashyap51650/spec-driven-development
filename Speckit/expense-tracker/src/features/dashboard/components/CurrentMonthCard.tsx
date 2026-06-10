import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CurrentMonth } from "@/types/dashboard";

interface CurrentMonthCardProps {
  currentMonth: CurrentMonth;
}

export function CurrentMonthCard({
  currentMonth,
}: CurrentMonthCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            <span>Income</span>
          </div>
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(currentMonth.income)}
          </span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            <span>Expenses</span>
          </div>
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(currentMonth.expenses)}
          </span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span>Balance</span>
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              currentMonth.balance >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {formatCurrency(currentMonth.balance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
