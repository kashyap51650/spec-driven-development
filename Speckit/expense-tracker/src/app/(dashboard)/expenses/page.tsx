import { EmptyState } from "@/components/shared/EmptyState";
import { getExpenses } from "@/data/expenses";
import type { ExpenseFilters } from "@/types/expense";

import { CreateExpenseButton } from "@/features/expenses/components/CreateExpenseButton";
import { ExpenseCardList } from "@/features/expenses/components/ExpenseCardList";
import { ExpenseFiltersBar } from "@/features/expenses/components/ExpenseFiltersBar";
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable";

interface ExpensesPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;

  const filters: ExpenseFilters = {
    category: params.category,
    startDate: params.startDate,
    endDate: params.endDate,
    search: params.search,
  };

  const expenses = await getExpenses(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <CreateExpenseButton />
      </div>

      <ExpenseFiltersBar
        category={filters.category}
        startDate={filters.startDate}
        endDate={filters.endDate}
        search={filters.search}
      />

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Track your spending by adding your first expense."
          action={<CreateExpenseButton />}
        />
      ) : (
        <>
          <ExpenseTable expenses={expenses} />
          <ExpenseCardList expenses={expenses} />
        </>
      )}
    </div>
  );
}
