import React from "react";
import type { Income } from "@/types/income";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import EditIncomeButton from "./EditIncomeButton";
import DeleteIncomeButton from "./DeleteIncomeButton";

export default function IncomeCard({ income }: { income: Income }) {
  return (
    <div className="border rounded-md p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{income.title}</h3>
          <div className="text-sm text-muted-foreground">
            {formatDate(new Date(income.date))}
          </div>
        </div>
        <div className="text-green-600 text-lg font-semibold">
          {formatCurrency(income.amount)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2 items-center">
          <Badge>{income.source}</Badge>
          <div className="text-sm text-muted-foreground">{income.account}</div>
        </div>
        <div className="flex gap-2">
          <EditIncomeButton income={income} />
          <DeleteIncomeButton id={income.id} />
        </div>
      </div>

      {income.notes ? <p className="mt-3 text-sm">{income.notes}</p> : null}
    </div>
  );
}
