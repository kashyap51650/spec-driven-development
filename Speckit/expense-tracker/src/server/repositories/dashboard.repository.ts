import { db } from "@/lib/prisma";
import type { RecentTransaction } from "@/types/dashboard";

export async function getMonthlySummary(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ totalIncome: number; totalExpenses: number }> {
  const [incomeResult, expenseResult] = await Promise.all([
    db.income.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    db.expense.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);
  return {
    totalIncome: incomeResult._sum.amount ?? 0,
    totalExpenses: expenseResult._sum.amount ?? 0,
  };
}

export async function getMonthlyTrends(
  userId: string,
  months: number = 6,
): Promise<{ month: string; income: number; expenses: number }[]> {
  const now = new Date();
  const monthRanges = Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    return {
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(d),
      startDate: new Date(year, month, 1, 0, 0, 0),
      endDate: new Date(year, month + 1, 0, 23, 59, 59),
    };
  });

  const results = await Promise.all(
    monthRanges.map(({ startDate, endDate }) =>
      getMonthlySummary(userId, startDate, endDate),
    ),
  );

  return monthRanges.map(({ label }, i) => ({
    month: label,
    income: results[i].totalIncome,
    expenses: results[i].totalExpenses,
  }));
}

export async function getCategoryBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ category: string; total: number; count: number }[]> {
  const rows = await db.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });
  return rows.map((r) => ({
    category: r.category,
    total: r._sum.amount ?? 0,
    count: r._count.id,
  }));
}

export async function getRecentTransactions(
  userId: string,
  limit: number = 8,
): Promise<RecentTransaction[]> {
  const [expenses, incomes] = await Promise.all([
    db.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, category: true, date: true },
    }),
    db.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, source: true, date: true },
    }),
  ]);

  const mapped: RecentTransaction[] = [
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

  return mapped
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
