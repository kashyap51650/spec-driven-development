import * as repo from "@/server/repositories/income.repository";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "@/server/validations/income.validation";
import type {
  Income,
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
} from "@/types/income";

export async function getAll(
  userId: string,
  filters?: IncomeFilters,
): Promise<Income[]> {
  return await repo.findAll(userId, filters);
}

export async function getById(id: string, userId: string): Promise<Income> {
  const res = await repo.findById(id, userId);
  if (!res) throw new Error("Income not found");
  return res;
}

export async function create(
  userId: string,
  input: CreateIncomeInput,
): Promise<Income> {
  const validated = createIncomeSchema.parse(input);
  const payload = {
    ...validated,
    notes: validated.notes ?? undefined,
  } as CreateIncomeInput;
  return await repo.create(userId, payload);
}

export async function update(
  id: string,
  userId: string,
  input: UpdateIncomeInput,
): Promise<Income> {
  const validated = updateIncomeSchema.parse(input);
  await getById(id, userId);
  const payload = {
    ...validated,
    notes: (validated as UpdateIncomeInput).notes ?? undefined,
  } as UpdateIncomeInput;
  return await repo.update(id, userId, payload);
}

export async function remove(id: string, userId: string): Promise<void> {
  await getById(id, userId);
  await repo.remove(id, userId);
}
