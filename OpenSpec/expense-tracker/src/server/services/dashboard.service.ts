import * as repo from "@/server/repositories/dashboard.repository";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [summary, monthlyTrends, rawCategories, recentTransactions] =
    await Promise.all([
      repo.getSummary(userId, startDate, endDate),
      repo.getMonthlyTrends(userId, 6),
      repo.getCategoryBreakdown(userId, startDate, endDate),
      repo.getRecentTransactions(userId, 8),
    ]);

  const { totalIncome, totalExpenses } = summary;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const categoryBreakdown = rawCategories.map((c) => ({
    ...c,
    percentage: totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0,
  }));

  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return {
    summary: { totalIncome, totalExpenses, netSavings, savingsRate },
    monthlyTrends,
    categoryBreakdown,
    recentTransactions,
    currentMonth: {
      income: totalIncome,
      expenses: totalExpenses,
      label: monthLabel,
    },
  };
}
