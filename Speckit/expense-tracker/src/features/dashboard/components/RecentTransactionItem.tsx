import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { RecentTransaction } from "@/types/dashboard";

interface RecentTransactionItemProps {
  transaction: RecentTransaction;
}

export function RecentTransactionItem({
  transaction,
}: RecentTransactionItemProps): React.JSX.Element {
  const isExpense = transaction.type === "expense";

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
          isExpense ? "bg-red-50" : "bg-green-50",
        )}
      >
        {isExpense ? (
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        ) : (
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.category}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-medium",
            isExpense ? "text-red-600" : "text-green-600",
          )}
        >
          {isExpense ? "–" : "+"}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>
    </div>
  );
}
