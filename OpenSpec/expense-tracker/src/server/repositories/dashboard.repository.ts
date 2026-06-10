import { prisma } from "@/lib/prisma";
import type { MonthlyTrend, RecentTransaction } from "@/types/dashboard";

export async function getSummary(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ totalIncome: number; totalExpenses: number }> {
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalIncome: incomeAgg._sum.amount ?? 0,
    totalExpenses: expenseAgg._sum.amount ?? 0,
  };
}

export async function getMonthlyTrends(
  userId: string,
  months: number = 6,
): Promise<MonthlyTrend[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: startDate } },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate } },
      select: { amount: true, date: true },
    }),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const buckets = new Map<string, { income: number; expenses: number; year: number; month: number }>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, { income: 0, expenses: 0, year: d.getFullYear(), month: d.getMonth() });
  }

  for (const r of incomes) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.income += r.amount;
  }

  for (const r of expenses) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.expenses += r.amount;
  }

  return Array.from(buckets.values()).map((b) => ({
    month: monthNames[b.month],
    income: b.income,
    expenses: b.expenses,
  }));
}

export async function getCategoryBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ category: string; total: number; count: number }[]> {
  const rows = await prisma.expense.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    select: { category: true, amount: true },
  });

  const map = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const existing = map.get(r.category) ?? { total: 0, count: 0 };
    map.set(r.category, { total: existing.total + r.amount, count: existing.count + 1 });
  }

  return Array.from(map.entries())
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);
}

export async function getRecentTransactions(
  userId: string,
  limit: number = 8,
): Promise<RecentTransaction[]> {
  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, category: true, date: true },
    }),
    prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, source: true, date: true },
    }),
  ]);

  const merged: RecentTransaction[] = [
    ...expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      type: "expense" as const,
      category: e.category,
      date: e.date,
    })),
    ...incomes.map((i) => ({
      id: i.id,
      title: i.title,
      amount: i.amount,
      type: "income" as const,
      category: i.source,
      date: i.date,
    })),
  ];

  return merged.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}
