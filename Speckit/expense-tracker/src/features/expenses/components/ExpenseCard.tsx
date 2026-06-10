import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Expense } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import { DeleteExpenseButton } from "./DeleteExpenseButton";
import { EditExpenseButton } from "./EditExpenseButton";

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="font-medium">{expense.title}</span>
        <span className="text-sm text-muted-foreground">{formatDate(expense.date)}</span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-red-600">{formatCurrency(expense.amount)}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{expense.category}</Badge>
          <span className="text-sm text-muted-foreground">{expense.account}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        {expense.notes && (
          <p className="flex-1 text-sm text-muted-foreground">{expense.notes}</p>
        )}
        <div className="ml-auto flex gap-1">
          <EditExpenseButton expense={expense} />
          <DeleteExpenseButton id={expense.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
