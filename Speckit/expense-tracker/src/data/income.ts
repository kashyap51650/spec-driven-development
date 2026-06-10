import { getSession } from "@/lib/auth";
import * as incomeService from "@/server/services/income.service";
import type { Income, IncomeFilters } from "@/types/income";

export async function getIncomes(filters?: IncomeFilters): Promise<Income[]> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return incomeService.getAll(session.userId, filters);
}

export async function getIncomeById(id: string): Promise<Income> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return incomeService.getById(id, session.userId);
}
