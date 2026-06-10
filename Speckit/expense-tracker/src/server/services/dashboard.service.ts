import * as dashboardRepository from "@/server/repositories/dashboard.repository";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const [summary, monthlyTrends, rawCategories, recentTransactions] =
    await Promise.all([
      dashboardRepository.getMonthlySummary(userId, startDate, endDate),
      dashboardRepository.getMonthlyTrends(userId, 6),
      dashboardRepository.getCategoryBreakdown(userId, startDate, endDate),
      dashboardRepository.getRecentTransactions(userId, 8),
    ]);

  const netSavings = summary.totalIncome - summary.totalExpenses;
  const savingsRate =
    summary.totalIncome > 0 ? (netSavings / summary.totalIncome) * 100 : 0;

  const categoryBreakdown = rawCategories.map((c) => ({
    ...c,
    percentage:
      summary.totalExpenses > 0 ? (c.total / summary.totalExpenses) * 100 : 0,
  }));

  const label = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(now);

  const hasData =
    summary.totalIncome > 0 ||
    summary.totalExpenses > 0 ||
    recentTransactions.length > 0;

  return {
    summary: {
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netSavings,
      savingsRate,
    },
    monthlyTrends,
    categoryBreakdown,
    recentTransactions,
    currentMonth: {
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      balance: summary.totalIncome - summary.totalExpenses,
      label,
    },
    hasData,
  };
}
