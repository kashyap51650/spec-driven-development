import { db } from "@/lib/prisma";
import type { CreateIncomeInput, Income, IncomeFilters, UpdateIncomeInput } from "@/types/income";

const INCOME_SELECT = {
  id: true,
  title: true,
  amount: true,
  source: true,
  account: true,
  date: true,
  notes: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapToIncome(raw: {
  id: string;
  title: string;
  amount: number;
  source: string;
  account: string;
  date: Date;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): Income {
  return {
    id: raw.id,
    title: raw.title,
    amount: raw.amount,
    source: raw.source,
    account: raw.account,
    date: raw.date,
    notes: raw.notes,
    userId: raw.userId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function findAll(userId: string, filters?: IncomeFilters): Promise<Income[]> {
  const where: Record<string, unknown> = { userId };

  if (filters?.source) {
    where.source = filters.source;
  }

  if (filters?.startDate || filters?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
    where.date = dateFilter;
  }

  if (filters?.search) {
    where.title = { contains: filters.search, mode: "insensitive" as const };
  }

  const rows = await db.income.findMany({
    where,
    select: INCOME_SELECT,
    orderBy: { date: "desc" },
  });

  return rows.map(mapToIncome);
}

export async function findById(id: string, userId: string): Promise<Income | null> {
  const raw = await db.income.findUnique({ where: { id }, select: INCOME_SELECT });
  if (!raw || raw.userId !== userId) return null;
  return mapToIncome(raw);
}

export async function create(userId: string, data: CreateIncomeInput): Promise<Income> {
  const raw = await db.income.create({
    data: { ...data, userId },
    select: INCOME_SELECT,
  });
  return mapToIncome(raw);
}

export async function update(id: string, _userId: string, data: UpdateIncomeInput): Promise<Income> {
  const raw = await db.income.update({
    where: { id },
    data,
    select: INCOME_SELECT,
  });
  return mapToIncome(raw);
}

export async function deleteById(id: string, _userId: string): Promise<void> {
  await db.income.delete({ where: { id } });
}

export async function getMonthlyTotal(userId: string, year: number, month: number): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const rows = await db.income.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { amount: true },
  });
  return rows.reduce((sum, r) => sum + r.amount, 0);
}
