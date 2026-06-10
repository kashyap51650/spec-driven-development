import React from "react";
import type { Expense } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import EditExpenseButton from "./EditExpenseButton";
import DeleteExpenseButton from "./DeleteExpenseButton";

export default function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <div className="border rounded-md p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{expense.title}</h3>
          <div className="text-sm text-muted-foreground">
            {formatDate(new Date(expense.date))}
          </div>
        </div>
        <div className="text-red-600 text-lg font-semibold">
          {formatCurrency(expense.amount)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2 items-center">
          <Badge>{expense.category}</Badge>
          <div className="text-sm text-muted-foreground">{expense.account}</div>
        </div>
        <div className="flex gap-2">
          <EditExpenseButton expense={expense} />
          <DeleteExpenseButton id={expense.id} />
        </div>
      </div>

      {expense.notes ? <p className="mt-3 text-sm">{expense.notes}</p> : null}
    </div>
  );
}
