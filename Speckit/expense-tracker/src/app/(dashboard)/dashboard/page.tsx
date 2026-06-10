import { getDashboardData } from "@/data/dashboard";
import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { SummaryCards } from "@/features/dashboard/components/SummaryCards";
import { MonthlyTrendChart } from "@/features/dashboard/components/MonthlyTrendChart";
import { CategoryBreakdownCard } from "@/features/dashboard/components/CategoryBreakdownCard";
import { CurrentMonthCard } from "@/features/dashboard/components/CurrentMonthCard";
import { RecentTransactionsList } from "@/features/dashboard/components/RecentTransactionsList";

export default async function DashboardPage(): Promise<React.ReactElement> {
  const data = await getDashboardData();
  const {
    summary,
    monthlyTrends,
    categoryBreakdown,
    recentTransactions,
    currentMonth,
    hasData,
  } = data;

  return (
    <div className="space-y-6">
      {!hasData && <WelcomeCard />}
      <DashboardHeader label={currentMonth.label} />
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart trends={monthlyTrends} />
        </div>
        <CategoryBreakdownCard breakdown={categoryBreakdown} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentMonthCard currentMonth={currentMonth} />
        <RecentTransactionsList transactions={recentTransactions} />
      </div>
    </div>
  );
}
