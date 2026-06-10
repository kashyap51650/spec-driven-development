import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface CurrentMonthCardProps {
  currentMonth: {
    income: number;
    expenses: number;
    label: string;
  };
}

export default function CurrentMonthCard({ currentMonth }: CurrentMonthCardProps) {
  const { income, expenses } = currentMonth;
  const balance = income - expenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Income</span>
          </div>
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(income)}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Expenses</span>
          </div>
          <span className="text-sm font-semibold text-red-600">
            {formatCurrency(expenses)}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Balance</span>
          <span className={`text-sm font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
