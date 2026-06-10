import { getSession } from "@/lib/auth";
import * as incomeService from "@/server/services/income.service";
import type { Income, IncomeFilters } from "@/types/income";

export async function getIncomes(filters?: IncomeFilters): Promise<Income[]> {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await incomeService.getAll(session.userId as string, filters);
}

export async function getIncomeById(id: string): Promise<Income> {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");
  return await incomeService.getById(id, session.userId as string);
}
