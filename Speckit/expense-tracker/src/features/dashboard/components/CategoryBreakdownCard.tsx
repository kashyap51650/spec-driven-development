import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CategoryBreakdown } from "@/types/dashboard";

interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdown[];
}

export function CategoryBreakdownCard({
  breakdown,
}: CategoryBreakdownCardProps): React.JSX.Element {
  const visible = breakdown.slice(0, 6);
  const remaining = breakdown.length - 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <EmptyState
            title="No expenses this month"
            description="Add some expenses to see your spending breakdown."
          />
        ) : (
          <div className="space-y-3">
            {visible.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{item.category}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {formatCurrency(item.total)} · {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))}
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                and {remaining} more{" "}
                {remaining === 1 ? "category" : "categories"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
