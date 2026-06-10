import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Income,
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
} from "@/types/income";

export async function findAll(
  userId: string,
  filters?: IncomeFilters,
): Promise<Income[]> {
  const where: Prisma.IncomeWhereInput = { userId };

  if (filters) {
    if (filters.source) where.source = filters.source;
    if (filters.startDate || filters.endDate) {
      where.date = {
        gte: filters.startDate ?? undefined,
        lte: filters.endDate ?? undefined,
      };
    }
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }
  }

  const items = await prisma.income.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return items as unknown as Income[];
}

export async function findById(
  id: string,
  userId: string,
): Promise<Income | null> {
  const item = await prisma.income.findFirst({ where: { id, userId } });
  return item as unknown as Income | null;
}

export async function create(
  userId: string,
  data: CreateIncomeInput,
): Promise<Income> {
  const created = await prisma.income.create({ data: { ...data, userId } });
  return created as unknown as Income;
}

export async function update(
  id: string,
  userId: string,
  data: UpdateIncomeInput,
): Promise<Income> {
  const existing = await prisma.income.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Income not found");

  const updated = await prisma.income.update({
    where: { id },
    data: data as UpdateIncomeInput,
  });
  return updated as unknown as Income;
}

export async function remove(id: string, userId: string): Promise<void> {
  await prisma.income.deleteMany({ where: { id, userId } });
}

export async function getMonthlyTotal(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const agg = await prisma.income.aggregate({
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  return agg._sum.amount ?? 0;
}
