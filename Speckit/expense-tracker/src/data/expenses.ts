import { getSession } from "@/lib/auth";
import * as expenseService from "@/server/services/expense.service";
import type { Expense, ExpenseFilters } from "@/types/expense";

export async function getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return expenseService.getAll(session.userId, filters);
}

export async function getExpenseById(id: string): Promise<Expense> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return expenseService.getById(id, session.userId);
}
