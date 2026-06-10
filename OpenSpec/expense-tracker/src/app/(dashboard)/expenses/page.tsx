import React from "react";
import { getExpenses } from "@/data/expenses";
import EmptyState from "@/components/shared/EmptyState";
import CreateExpenseButton from "@/features/expenses/components/CreateExpenseButton";
import ExpenseFiltersBar from "@/features/expenses/components/ExpenseFiltersBar";
import ExpenseTable from "@/features/expenses/components/ExpenseTable";
import ExpenseCardList from "@/features/expenses/components/ExpenseCardList";
import type { ExpenseFilters } from "@/types/expense";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}): Promise<React.ReactNode> {
  const { category, startDate, endDate, search } = await searchParams;

  const filters: ExpenseFilters = {};
  if (category) filters.category = category;
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);
  if (search) filters.search = search;

  const expenses = await getExpenses(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <CreateExpenseButton />
      </div>

      <ExpenseFiltersBar
        category={category}
        startDate={startDate}
        endDate={endDate}
        search={search}
      />

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses"
          description="You have no recorded expenses. Add one to get started."
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
