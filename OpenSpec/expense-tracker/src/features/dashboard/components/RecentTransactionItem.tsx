import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { RecentTransaction } from "@/types/dashboard";

interface RecentTransactionItemProps {
  transaction: RecentTransaction;
}

export default function RecentTransactionItem({ transaction }: RecentTransactionItemProps) {
  const isExpense = transaction.type === "expense";

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full ${
          isExpense ? "bg-red-100" : "bg-green-100"
        }`}
      >
        {isExpense ? (
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        ) : (
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{transaction.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{transaction.category}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
          {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
      </div>
    </div>
  );
}
