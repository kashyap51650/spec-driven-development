import type { Expense } from "@/types/expense";

import { ExpenseCard } from "./ExpenseCard";

interface ExpenseCardListProps {
  expenses: Expense[];
}

export function ExpenseCardList({ expenses }: ExpenseCardListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 block md:hidden">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
