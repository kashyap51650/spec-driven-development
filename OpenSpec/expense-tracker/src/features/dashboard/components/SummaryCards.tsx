import { ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp } from "lucide-react";
import SummaryCard from "./SummaryCard";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DashboardSummary } from "@/types/dashboard";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const { totalIncome, totalExpenses, netSavings, savingsRate } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Income"
        value={formatCurrency(totalIncome)}
        icon={ArrowUpCircle}
        iconColor="text-green-500"
        description="This month"
      />
      <SummaryCard
        label="Total Expenses"
        value={formatCurrency(totalExpenses)}
        icon={ArrowDownCircle}
        iconColor="text-red-500"
        description="This month"
      />
      <SummaryCard
        label="Net Savings"
        value={formatCurrency(netSavings)}
        icon={PiggyBank}
        iconColor="text-blue-500"
        valueColor={netSavings >= 0 ? "text-green-600" : "text-red-600"}
        description={netSavings >= 0 ? "Positive balance" : "Negative balance"}
      />
      <SummaryCard
        label="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        icon={TrendingUp}
        iconColor="text-purple-500"
        description="of income saved this month"
      />
    </div>
  );
}
