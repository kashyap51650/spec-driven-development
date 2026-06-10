import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
} from "@/types/expense";

export async function findAll(
  userId: string,
  filters?: ExpenseFilters,
): Promise<Expense[]> {
  const where: Prisma.ExpenseWhereInput = { userId };

  if (filters) {
    if (filters.category) where.category = filters.category;
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

  const items = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return items as unknown as Expense[];
}

export async function findById(
  id: string,
  userId: string,
): Promise<Expense | null> {
  const item = await prisma.expense.findFirst({
    where: { id, userId },
  });
  return item as unknown as Expense | null;
}

export async function create(
  userId: string,
  data: CreateExpenseInput,
): Promise<Expense> {
  const created = await prisma.expense.create({
    data: { ...data, userId },
  });
  return created as unknown as Expense;
}

export async function update(
  id: string,
  userId: string,
  data: UpdateExpenseInput,
): Promise<Expense> {
  // ensure scoping by userId
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Expense not found");

  const updated = await prisma.expense.update({
    where: { id },
    data: data as UpdateExpenseInput,
  });

  return updated as unknown as Expense;
}

export async function remove(id: string, userId: string): Promise<void> {
  await prisma.expense.deleteMany({ where: { id, userId } });
}

export async function getTotalByCategory(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ category: string; total: number }[]> {
  const rows = await prisma.expense.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    select: { category: true, amount: true },
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
  }

  return Array.from(map.entries()).map(([category, total]) => ({
    category,
    total,
  }));
}
