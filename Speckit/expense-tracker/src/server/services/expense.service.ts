import * as expenseRepository from "@/server/repositories/expense.repository";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/server/validations/expense.validation";
import type { CreateExpenseInput, Expense, ExpenseFilters, UpdateExpenseInput } from "@/types/expense";

export async function getAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
  return expenseRepository.findAll(userId, filters);
}

export async function getById(id: string, userId: string): Promise<Expense> {
  const expense = await expenseRepository.findById(id, userId);
  if (!expense) throw new Error("Expense not found");
  return expense;
}

export async function create(userId: string, input: CreateExpenseInput): Promise<Expense> {
  const data = createExpenseSchema.parse(input);
  return expenseRepository.create(userId, data);
}

export async function update(id: string, userId: string, input: UpdateExpenseInput): Promise<Expense> {
  await getById(id, userId);
  const data = updateExpenseSchema.parse(input);
  return expenseRepository.update(id, userId, data);
}

export async function deleteExpense(id: string, userId: string): Promise<void> {
  await getById(id, userId);
  await expenseRepository.deleteById(id, userId);
}
