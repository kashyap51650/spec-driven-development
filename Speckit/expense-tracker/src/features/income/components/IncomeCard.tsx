import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Income } from "@/types/income";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import { DeleteIncomeButton } from "./DeleteIncomeButton";
import { EditIncomeButton } from "./EditIncomeButton";

interface IncomeCardProps {
  income: Income;
}

export function IncomeCard({ income }: IncomeCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="font-medium">{income.title}</span>
        <span className="text-sm text-muted-foreground">{formatDate(income.date)}</span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-green-600">{formatCurrency(income.amount)}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{income.source}</Badge>
          <span className="text-sm text-muted-foreground">{income.account}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        {income.notes && (
          <p className="flex-1 text-sm text-muted-foreground">{income.notes}</p>
        )}
        <div className="ml-auto flex gap-1">
          <EditIncomeButton income={income} />
          <DeleteIncomeButton id={income.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
