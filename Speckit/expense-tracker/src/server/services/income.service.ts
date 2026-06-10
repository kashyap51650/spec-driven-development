import * as incomeRepository from "@/server/repositories/income.repository";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "@/server/validations/income.validation";
import type { CreateIncomeInput, Income, IncomeFilters, UpdateIncomeInput } from "@/types/income";

export async function getAll(userId: string, filters?: IncomeFilters): Promise<Income[]> {
  return incomeRepository.findAll(userId, filters);
}

export async function getById(id: string, userId: string): Promise<Income> {
  const income = await incomeRepository.findById(id, userId);
  if (!income) throw new Error("Income not found");
  return income;
}

export async function create(userId: string, input: CreateIncomeInput): Promise<Income> {
  const data = createIncomeSchema.parse(input);
  return incomeRepository.create(userId, data);
}

export async function update(id: string, userId: string, input: UpdateIncomeInput): Promise<Income> {
  await getById(id, userId);
  const data = updateIncomeSchema.parse(input);
  return incomeRepository.update(id, userId, data);
}

export async function deleteIncome(id: string, userId: string): Promise<void> {
  await getById(id, userId);
  await incomeRepository.deleteById(id, userId);
}
