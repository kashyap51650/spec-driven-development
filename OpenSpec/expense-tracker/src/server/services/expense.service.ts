import * as repo from "@/server/repositories/expense.repository";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/server/validations/expense.validation";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "@/types/expense";

export async function getAll(
  userId: string,
  filters?: ExpenseFilters,
): Promise<Expense[]> {
  return await repo.findAll(userId, filters);
}

export async function getById(id: string, userId: string): Promise<Expense> {
  const res = await repo.findById(id, userId);
  if (!res) throw new Error("Expense not found");
  return res;
}

export async function create(
  userId: string,
  input: CreateExpenseInput,
): Promise<Expense> {
  const validated = createExpenseSchema.parse(input);
  const payload = {
    ...validated,
    notes: validated.notes ?? undefined,
  } as CreateExpenseInput;
  return await repo.create(userId, payload);
}

export async function update(
  id: string,
  userId: string,
  input: UpdateExpenseInput,
): Promise<Expense> {
  const validated = updateExpenseSchema.parse(input);
  // ensure exists and belongs to user
  await getById(id, userId);
  const payload = {
    ...validated,
    notes: (validated as UpdateExpenseInput).notes ?? undefined,
  } as UpdateExpenseInput;
  return await repo.update(id, userId, payload);
}

export async function remove(id: string, userId: string): Promise<void> {
  // ensure exists
  await getById(id, userId);
  await repo.remove(id, userId);
}
