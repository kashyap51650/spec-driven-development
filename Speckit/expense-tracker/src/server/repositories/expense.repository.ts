import { db } from "@/lib/prisma";
import type { CreateExpenseInput, Expense, ExpenseFilters, UpdateExpenseInput } from "@/types/expense";

const EXPENSE_SELECT = {
  id: true,
  title: true,
  amount: true,
  category: true,
  account: true,
  date: true,
  notes: true,
  tags: true,
  recurring: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapToExpense(raw: {
  id: string;
  title: string;
  amount: number;
  category: string;
  account: string;
  date: Date;
  notes: string | null;
  tags: string[];
  recurring: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    id: raw.id,
    title: raw.title,
    amount: raw.amount,
    category: raw.category,
    account: raw.account,
    date: raw.date,
    notes: raw.notes,
    tags: raw.tags,
    recurring: raw.recurring,
    userId: raw.userId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function findAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
  const where: Record<string, unknown> = { userId };

  if (filters?.category) {
    where.category = filters.category;
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

  const rows = await db.expense.findMany({
    where,
    select: EXPENSE_SELECT,
    orderBy: { date: "desc" },
  });

  return rows.map(mapToExpense);
}

export async function findById(id: string, userId: string): Promise<Expense | null> {
  const raw = await db.expense.findUnique({ where: { id }, select: EXPENSE_SELECT });
  if (!raw || raw.userId !== userId) return null;
  return mapToExpense(raw);
}

export async function create(userId: string, data: CreateExpenseInput): Promise<Expense> {
  const raw = await db.expense.create({
    data: { ...data, userId },
    select: EXPENSE_SELECT,
  });
  return mapToExpense(raw);
}

export async function update(id: string, _userId: string, data: UpdateExpenseInput): Promise<Expense> {
  const raw = await db.expense.update({
    where: { id },
    data,
    select: EXPENSE_SELECT,
  });
  return mapToExpense(raw);
}

export async function deleteById(id: string, _userId: string): Promise<void> {
  await db.expense.delete({ where: { id } });
}

export async function getTotalByCategory(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ category: string; total: number }[]> {
  const rows = await db.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });
  return rows.map((r) => ({ category: r.category, total: r._sum.amount ?? 0 }));
}
