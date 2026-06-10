import { getSession } from "@/lib/auth";
import * as expenseService from "@/server/services/expense.service";
import type { Expense, ExpenseFilters } from "@/types/expense";

export async function getExpenses(
  filters?: ExpenseFilters,
): Promise<Expense[]> {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await expenseService.getAll(session.userId as string, filters);
}

export async function getExpenseById(id: string): Promise<Expense> {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await expenseService.getById(id, session.userId as string);
}
