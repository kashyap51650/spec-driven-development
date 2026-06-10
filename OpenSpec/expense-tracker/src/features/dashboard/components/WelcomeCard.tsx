import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default function WelcomeCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center text-center py-10 gap-4">
        <h2 className="text-xl font-semibold">Welcome to Expense Tracker</h2>
        <p className="text-muted-foreground max-w-sm">
          Start by adding your first income or expense to see your dashboard come to life.
        </p>
        <div className="flex gap-3 mt-2">
          <Button asChild variant="default">
            <Link href="/income" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Add Income
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/expenses" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
