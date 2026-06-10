export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  date: Date;
}

export interface CurrentMonth {
  income: number;
  expenses: number;
  balance: number;
  label: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: RecentTransaction[];
  currentMonth: CurrentMonth;
  hasData: boolean;
}
