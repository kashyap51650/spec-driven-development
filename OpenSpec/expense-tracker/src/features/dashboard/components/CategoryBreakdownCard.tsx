import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CategoryBreakdown } from "@/types/dashboard";

interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdown[];
}

export default function CategoryBreakdownCard({
  breakdown,
}: CategoryBreakdownCardProps) {
  const visible = breakdown.slice(0, 6);
  const overflow = breakdown.length - visible.length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses this month
          </p>
        ) : (
          <div className="space-y-4">
            {visible.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {item.category}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
            {overflow > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                and {overflow} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
