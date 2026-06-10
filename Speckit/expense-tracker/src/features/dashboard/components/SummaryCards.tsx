import { ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DashboardSummary } from "@/types/dashboard";
import { SummaryCard } from "./SummaryCard";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Income"
        value={formatCurrency(summary.totalIncome)}
        icon={ArrowUpCircle}
        iconClassName="text-green-500"
        valueClassName="text-green-600"
      />
      <SummaryCard
        label="Total Expenses"
        value={formatCurrency(summary.totalExpenses)}
        icon={ArrowDownCircle}
        iconClassName="text-red-500"
        valueClassName="text-red-600"
      />
      <SummaryCard
        label="Net Savings"
        value={formatCurrency(summary.netSavings)}
        icon={PiggyBank}
        iconClassName="text-blue-500"
        valueClassName={summary.netSavings >= 0 ? "text-green-600" : "text-red-600"}
      />
      <SummaryCard
        label="Savings Rate"
        value={`${summary.savingsRate.toFixed(1)}%`}
        description="of income saved this month"
        icon={TrendingUp}
        iconClassName="text-purple-500"
      />
    </div>
  );
}
