import { getDashboardData } from "@/data/dashboard";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import SummaryCards from "@/features/dashboard/components/SummaryCards";
import MonthlyTrendChart from "@/features/dashboard/components/MonthlyTrendChart";
import CategoryBreakdownCard from "@/features/dashboard/components/CategoryBreakdownCard";
import RecentTransactionsList from "@/features/dashboard/components/RecentTransactionsList";
import WelcomeCard from "@/features/dashboard/components/WelcomeCard";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const isEmpty =
    data.summary.totalIncome === 0 && data.summary.totalExpenses === 0;

  return (
    <div className="space-y-6">
      <DashboardHeader currentMonth={data.currentMonth.label} />
      {isEmpty && <WelcomeCard />}
      <SummaryCards summary={data.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart trends={data.monthlyTrends} />
        </div>
        <div>
          <CategoryBreakdownCard breakdown={data.categoryBreakdown} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactionsList transactions={data.recentTransactions} />
      </div>
    </div>
  );
}
