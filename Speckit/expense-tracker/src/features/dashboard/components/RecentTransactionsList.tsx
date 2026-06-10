import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RecentTransaction } from "@/types/dashboard";
import { RecentTransactionItem } from "./RecentTransactionItem";

interface RecentTransactionsListProps {
  transactions: RecentTransaction[];
}

export function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link
          href="/expenses"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            title="No recent transactions"
            description="Your recent income and expense records will appear here."
          />
        ) : (
          <div className="divide-y">
            {transactions.map((t) => (
              <RecentTransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
