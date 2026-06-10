import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentTransactionItem from "./RecentTransactionItem";
import type { RecentTransaction } from "@/types/dashboard";

interface RecentTransactionsListProps {
  transactions: RecentTransaction[];
}

export default function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
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
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent transactions
          </p>
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
