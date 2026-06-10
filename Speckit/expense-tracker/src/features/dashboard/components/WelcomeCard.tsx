import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function WelcomeCard(): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Expense Tracker</h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Start by adding your first income or expense to see your dashboard come
          to life.
        </p>
        <div className="flex gap-3">
          <Link href="/income" className={buttonVariants()}>
            Add Income
          </Link>
          <Link href="/expenses" className={buttonVariants({ variant: "outline" })}>
            Add Expense
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
