import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Expense } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import EditExpenseButton from "./EditExpenseButton";
import DeleteExpenseButton from "./DeleteExpenseButton";

export default function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{formatDate(new Date(e.date))}</TableCell>
              <TableCell>{e.title}</TableCell>
              <TableCell>
                <Badge>{e.category}</Badge>
              </TableCell>
              <TableCell>{e.account}</TableCell>
              <TableCell className="text-red-600">
                {formatCurrency(e.amount)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <EditExpenseButton expense={e} />
                  <DeleteExpenseButton id={e.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
