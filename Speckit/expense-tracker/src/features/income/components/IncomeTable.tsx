import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Income } from "@/types/income";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import { DeleteIncomeButton } from "./DeleteIncomeButton";
import { EditIncomeButton } from "./EditIncomeButton";

interface IncomeTableProps {
  incomes: Income[];
}

export function IncomeTable({ incomes }: IncomeTableProps): React.JSX.Element {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(income.date)}
              </TableCell>
              <TableCell className="font-medium">{income.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{income.source}</Badge>
              </TableCell>
              <TableCell>{income.account}</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {formatCurrency(income.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <EditIncomeButton income={income} />
                  <DeleteIncomeButton id={income.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
